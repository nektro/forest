package stack

import "errors"

// ErrEmpty is returned when popping an empty stack.
var ErrEmpty = errors.New("stack: empty")

// Stack is a last-in, first-out collection.
type Stack[T any] struct {
	items []T
}

// Push adds v to the top of the stack.
func (s *Stack[T]) Push(v T) {
	s.items = append(s.items, v)
}

// Pop removes and returns the top of the stack.
func (s *Stack[T]) Pop() (T, error) {
	var zero T
	if len(s.items) == 0 {
		return zero, ErrEmpty
	}
	v := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return v, nil
}

// Drain sends every item on a channel, top first, and closes it.
func (s *Stack[T]) Drain() <-chan T {
	ch := make(chan T)
	go func() {
		defer close(ch)
		for {
			v, err := s.Pop()
			if err != nil {
				return
			}
			ch <- v
		}
	}()
	return ch
}
