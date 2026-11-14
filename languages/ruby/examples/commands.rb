#!/usr/bin/env ruby
# A tiny command dispatcher, with pattern matching.

COMMANDS = %w[add list done help].freeze

def parse(argv)
  case argv
  in ["add", *words] if words.any?
    { action: :add, text: words.join(" ") }
  in ["done", /\A\d+\z/ => id]
    { action: :done, id: id.to_i }
  in ["list"] | []
    { action: :list }
  in [cmd, *] unless COMMANDS.include?(cmd)
    { action: :unknown, name: cmd }
  else
    { action: :help }
  end
end

tasks = []

loop do
  print "> "
  line = $stdin.gets or break

  case parse(line.split)
  in { action: :add, text: }
    tasks << { text:, done: false }
  in { action: :done, id: } if (task = tasks[id - 1])
    task[:done] = true
  in { action: :list }
    tasks.each.with_index(1) do |task, i|
      mark = task[:done] ? "x" : " "
      puts "#{i}. [#{mark}] #{task[:text]}"
    end
  in { action: :unknown, name: }
    warn "unknown command: #{name}"
  else
    puts <<~HELP
      Commands:
        add TEXT   add a task
        list       show tasks
        done N     mark task N done
    HELP
  end
end
