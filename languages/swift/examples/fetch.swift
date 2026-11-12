enum FetchError: Error {
    case badStatus(Int)
    case empty
}

actor Cache<Key: Hashable & Sendable, Value: Sendable> {
    private var storage: [Key: Value] = [:]

    func value(for key: Key, orInsert make: @Sendable () async throws -> Value) async rethrows -> Value {
        if let cached = storage[key] {
            return cached
        }
        let value = try await make()
        storage[key] = value
        return value
    }
}

func load(_ id: Int, from cache: Cache<Int, String>) async {
    do {
        let body = try await cache.value(for: id) {
            guard id > 0 else { throw FetchError.badStatus(404) }
            return #"{"id": \#(id)}"#
        }
        print(body)
    } catch FetchError.badStatus(let code) where code >= 500 {
        print("server error \(code)")
    } catch {
        print("failed: \(error)")
    }
}
