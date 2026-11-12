import java.util.HashMap;
import java.util.Map;

// A compact source file (Java 25): no class declaration needed.

final Map<String, Integer> counts = new HashMap<>();

void main() {
    String text = """
        the quick brown fox
        jumps over the "lazy" dog\tand the fox
        """;
    for (String word : text.split("\\s+")) {
        counts.merge(word, 1, Integer::sum);
    }
    counts.entrySet().stream()
        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
        .limit(3)
        .forEach(e -> IO.println(e.getKey() + ": " + e.getValue()));
}
