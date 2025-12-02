/**
 * Testing Utilities
 *
 * Mock helpers and test data generation for server functions
 */

import type { Session } from "neo4j-driver";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";

/**
 * Mock session that records all queries
 */
export class MockSession {
  public queries: Array<{ query: string; params: any }> = [];
  public mockResults: Map<string, any[]> = new Map();

  /**
   * Mock run method
   */
  async run(query: string, params?: any): Promise<any> {
    this.queries.push({ query, params: params || {} });

    // Check for mock result
    const mockResult = this.mockResults.get(query);

    return {
      records: mockResult || [],
    };
  }

  /**
   * Set mock result for query
   */
  mockResult(query: string, records: any[]): void {
    this.mockResults.set(query, records);
  }

  /**
   * Clear recorded queries
   */
  clear(): void {
    this.queries = [];
  }

  /**
   * Get last query
   */
  getLastQuery(): { query: string; params: any } | null {
    return this.queries[this.queries.length - 1] || null;
  }

  /**
   * Check if query was called
   */
  wasQueryCalled(queryPattern: string | RegExp): boolean {
    if (typeof queryPattern === "string") {
      return this.queries.some((q) => q.query.includes(queryPattern));
    }
    return this.queries.some((q) => queryPattern.test(q.query));
  }

  /**
   * Stub methods to satisfy Session interface
   */
  async close(): Promise<void> {
    // Mock implementation
  }

  async beginTransaction(): Promise<any> {
    return this;
  }
}

/**
 * Create mock session
 */
export function createMockSession(): MockSession {
  return new MockSession();
}

/**
 * Mock user generator
 */
export interface MockUserOptions {
  id?: string;
  uuid?: string;
  email?: string;
  name?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  isAdmin?: boolean;
  [key: string]: any;
}

/**
 * Create mock user
 */
export function createMockUser(options: MockUserOptions = {}): any {
  const id = options.id || `user_${Date.now()}`;
  const uuid = options.uuid || `uuid_${Date.now()}`;

  return {
    id,
    P: {
      uuid,
      id,
      email: options.email || `user${Date.now()}@example.com`,
      name: options.name || "Test User",
      role: options.role || "user",
      roles: options.roles || [options.role || "user"],
      permissions: options.permissions || [],
      isAdmin: options.isAdmin || false,
      ...Object.fromEntries(
        Object.entries(options).filter(
          ([key]) =>
            !["id", "uuid", "email", "name", "role", "roles", "permissions", "isAdmin"].includes(
              key
            )
        )
      ),
    },
  };
}

/**
 * Mock vertex generator
 */
export function createMockVertex(
  id: string,
  labels: string[],
  properties: Record<string, any> = {}
): Vertex {
  return {
    id,
    L: labels,
    P: properties,
    IN: {},
    OUT: {},
  };
}

/**
 * Mock edge generator
 */
export function createMockEdge(
  id: string,
  type: string,
  startId: string,
  endId: string,
  properties: Record<string, any> = {}
): Edge {
  return {
    id,
    T: type,
    S: startId,
    E: endId,
    P: properties,
  };
}

/**
 * Test fixture generator
 */
export class FixtureGenerator {
  private counter = 0;

  /**
   * Generate unique ID
   */
  id(prefix: string = "test"): string {
    return `${prefix}_${Date.now()}_${this.counter++}`;
  }

  /**
   * Generate user fixture
   */
  user(overrides: Partial<MockUserOptions> = {}): any {
    return createMockUser({
      id: this.id("user"),
      uuid: this.id("uuid"),
      ...overrides,
    });
  }

  /**
   * Generate vertex fixture
   */
  vertex(label: string, properties: Record<string, any> = {}): Vertex {
    return createMockVertex(this.id(label.toLowerCase()), [label], {
      id: this.id(label.toLowerCase()),
      ...properties,
    });
  }

  /**
   * Generate edge fixture
   */
  edge(
    type: string,
    startId: string,
    endId: string,
    properties: Record<string, any> = {}
  ): Edge {
    return createMockEdge(this.id("edge"), type, startId, endId, properties);
  }

  /**
   * Generate array of fixtures
   */
  many<T>(count: number, generator: (index: number) => T): T[] {
    return Array.from({ length: count }, (_, index) => generator(index));
  }
}

/**
 * Create fixture generator
 */
export function createFixtureGenerator(): FixtureGenerator {
  return new FixtureGenerator();
}

/**
 * Seed test data
 */
export async function seedTestData(
  session: Session,
  label: string,
  data: Array<Record<string, any>>
): Promise<Vertex[]> {
  const vertices: Vertex[] = [];

  for (const item of data) {
    const keys = Object.keys(item);
    const props = keys.map((key) => `${key}: $props.${key}`).join(", ");

    const query = `
      CREATE (n:${label} {${props}})
      RETURN n
    `;

    const result = await session.run(query, { props: item });
    const vertex = result.records[0]?.get("n");

    if (vertex) {
      vertices.push({
        id: vertex.identity.toString(),
        L: vertex.labels,
        P: vertex.properties,
        IN: {},
        OUT: {},
      });
    }
  }

  return vertices;
}

/**
 * Clear test data
 */
export async function clearTestData(
  session: Session,
  labels?: string | string[]
): Promise<number> {
  let query: string;

  if (!labels) {
    // Clear all data
    query = "MATCH (n) DETACH DELETE n RETURN count(n) as deleted";
  } else if (Array.isArray(labels)) {
    // Clear specific labels
    const labelConditions = labels.map((label) => `n:${label}`).join(" OR ");
    query = `MATCH (n) WHERE ${labelConditions} DETACH DELETE n RETURN count(n) as deleted`;
  } else {
    // Clear single label
    query = `MATCH (n:${labels}) DETACH DELETE n RETURN count(n) as deleted`;
  }

  const result = await session.run(query);
  return result.records[0]?.get("deleted").toNumber() || 0;
}

/**
 * Assert helpers for testing
 */
export const assert = {
  /**
   * Assert vertex has property
   */
  hasProperty(vertex: Vertex, property: string, value?: any): void {
    if (!(property in vertex.P)) {
      throw new Error(`Vertex does not have property: ${property}`);
    }

    if (value !== undefined && vertex.P[property] !== value) {
      throw new Error(
        `Expected property ${property} to be ${value}, got ${vertex.P[property]}`
      );
    }
  },

  /**
   * Assert vertex has label
   */
  hasLabel(vertex: Vertex, label: string): void {
    if (!vertex.L.includes(label)) {
      throw new Error(`Vertex does not have label: ${label}`);
    }
  },

  /**
   * Assert edge connects vertices
   */
  connects(edge: Edge, startId: string, endId: string): void {
    if (edge.S !== startId || edge.E !== endId) {
      throw new Error(
        `Edge does not connect ${startId} to ${endId}, got ${edge.S} to ${edge.E}`
      );
    }
  },

  /**
   * Assert query was called
   */
  queryWasCalled(mockSession: MockSession, queryPattern: string | RegExp): void {
    if (!mockSession.wasQueryCalled(queryPattern)) {
      throw new Error(`Query was not called: ${queryPattern}`);
    }
  },

  /**
   * Assert deep equal
   */
  deepEqual(actual: any, expected: any): void {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);

    if (actualStr !== expectedStr) {
      throw new Error(
        `Expected ${expectedStr}, got ${actualStr}`
      );
    }
  },
};

/**
 * Wait for condition
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`);
}

/**
 * Testing utilities factory
 */
export const test = {
  /**
   * Create mock session
   */
  createMockSession,

  /**
   * Create mock user
   */
  createMockUser,

  /**
   * Create mock vertex
   */
  createMockVertex,

  /**
   * Create mock edge
   */
  createMockEdge,

  /**
   * Create fixture generator
   */
  createFixtures: createFixtureGenerator,

  /**
   * Seed test data
   */
  seed: seedTestData,

  /**
   * Clear test data
   */
  clear: clearTestData,

  /**
   * Assertions
   */
  assert,

  /**
   * Wait for condition
   */
  waitFor,
};

/**
 * Snapshot testing
 */
export class SnapshotManager {
  private snapshots: Map<string, any> = new Map();

  /**
   * Save snapshot
   */
  save(name: string, data: any): void {
    this.snapshots.set(name, JSON.parse(JSON.stringify(data)));
  }

  /**
   * Match snapshot
   */
  match(name: string, data: any): boolean {
    const snapshot = this.snapshots.get(name);
    if (!snapshot) {
      throw new Error(`Snapshot "${name}" not found`);
    }

    const dataStr = JSON.stringify(data);
    const snapshotStr = JSON.stringify(snapshot);

    return dataStr === snapshotStr;
  }

  /**
   * Assert matches snapshot
   */
  assertMatch(name: string, data: any): void {
    if (!this.match(name, data)) {
      throw new Error(`Data does not match snapshot "${name}"`);
    }
  }

  /**
   * Clear snapshots
   */
  clear(): void {
    this.snapshots.clear();
  }
}

/**
 * Create snapshot manager
 */
export function createSnapshotManager(): SnapshotManager {
  return new SnapshotManager();
}
