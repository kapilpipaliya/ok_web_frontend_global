import neo4j from "neo4j-driver";
const driver = neo4j.driver("bolt://65.109.174.193:1102", undefined,
 {disableLosslessIntegers: true});
const session = driver.session();

const result  = session.run('MATCH (n) return n;', {}).then(x=>console.log(x))