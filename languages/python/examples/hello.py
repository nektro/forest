def main() -> None:
    name = input("Name: ")
    print(f"Hello, {name or 'world'}!")


if __name__ == "__main__":
    main()
