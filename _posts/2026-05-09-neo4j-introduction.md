---
layout: post
title: "Neo4j 图数据库简介与基本应用"
date: 2026-05-09 14:00:00 +0800
excerpt: "了解 Neo4j 图数据库的核心概念、数据模型以及基本应用场景，快速入门图数据库开发。"
---

## 什么是 Neo4j？

Neo4j 是目前最流行的原生图数据库，以节点（Node）、关系（Relationship）和属性（Property）为核心数据模型，天然适合表达和查询复杂的数据关联关系。与传统关系型数据库用表格存储数据不同，Neo4j 用图结构存储数据，让"关系"成为一等公民。

## 核心概念

### 节点（Node）

节点是图中的实体，相当于关系型数据库中的一条记录。每个节点可以有一个或多个标签（Label），用来标识其角色。

```cypher
CREATE (p:Person {name: '张三', age: 28})
```

上面的语句创建了一个带有 `Person` 标签的节点，包含 `name` 和 `age` 两个属性。

### 关系（Relationship）

关系连接两个节点，是有方向和类型的。关系也可以携带属性。

```cypher
CREATE (p1:Person {name: '张三'})-[r:KNOWS {since: 2020}]->(p2:Person {name: '李四'})
```

### 属性（Property）

节点和关系都可以有键值对形式的属性，支持字符串、数值、布尔等基本类型。

### 标签（Label）

标签用于对节点分类，类似于关系型数据库中的表名。一个节点可以有多个标签。

## Cypher 查询语言

Neo4j 使用 Cypher 作为声明式查询语言，语法直观，用类似 ASCII 艺术的方式表达图模式。

### 基本增删改查

**创建数据：**

```cypher
CREATE (alice:Person {name: 'Alice', age: 30}),
       (bob:Person {name: 'Bob', age: 25}),
       (alice)-[:KNOWS {since: 2022}]->(bob)
```

**查询数据：**

```cypher
// 查找所有 Person 节点
MATCH (p:Person) RETURN p

// 查找 Alice 认识的人
MATCH (p:Person {name: 'Alice'})-[:KNOWS]->(friend)
RETURN friend.name, friend.age
```

**更新数据：**

```cypher
MATCH (p:Person {name: 'Alice'})
SET p.age = 31
RETURN p
```

**删除数据：**

```cypher
// 删除节点及其所有关系
MATCH (p:Person {name: 'Bob'})
DETACH DELETE p
```

### 多跳查询

图数据库的强项在于多跳遍历查询，这在关系型数据库中需要多表 JOIN 才能实现。

```cypher
// 查找 Alice 的朋友的朋友（二度关系）
MATCH (alice:Person {name: 'Alice'})-[:KNOWS*2]-(fof)
RETURN DISTINCT fof.name
```

### 最短路径

```cypher
MATCH p = shortestPath(
  (a:Person {name: 'Alice'})-[:KNOWS*]-(b:Person {name: 'David'})
)
RETURN p
```

## 安装与快速启动

### 使用 Docker 启动

最简单的方式是通过 Docker 运行 Neo4j：

```bash
docker run \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:5
```

启动后访问 `http://localhost:7474` 即可打开 Neo4j Browser，在浏览器中直接执行 Cypher 查询。

### 下载安装

也可以从 [Neo4j 官网](https://neo4j.com/download/) 下载社区版，支持 Windows、macOS 和 Linux。

## 基本应用场景

### 1. 社交网络

图数据库天然适合社交场景——好友关系、关注链、推荐共同好友等操作在图模型中极为高效。

```cypher
// 推荐可能认识的人：朋友的朋友但还不是朋友
MATCH (me:Person {name: 'Alice'})-[:KNOWS]->(:Person)-[:KNOWS]->(suggestion)
WHERE NOT (me)-[:KNOWS]-(suggestion)
RETURN suggestion.name, count(*) AS mutualFriends
ORDER BY mutualFriends DESC
```

### 2. 知识图谱

将实体和实体间的关系建模为图，支持语义搜索和推理。

```cypher
CREATE (js:Technology {name: 'JavaScript'}),
       (react:Framework {name: 'React'}),
       (react)-[:BUILT_WITH]->(js)
```

### 3. 欺诈检测

通过图查询发现异常关联模式，例如多个账户共用同一设备或地址。

```cypher
// 查找共用同一 IP 的不同用户
MATCH (u1:User)-[:LOGGED_IN_FROM]->(ip:IPAddress)<-[:LOGGED_IN_FROM]-(u2:User)
WHERE u1 <> u2
RETURN u1.name, u2.name, ip.address
```

### 4. 权限与访问控制

基于角色的访问控制（RBAC）用图来建模非常自然，用户-角色-权限的多层关系查询一步到位。

```cypher
// 查询用户拥有的所有权限（通过角色继承）
MATCH (u:User {name: 'Alice'})-[:HAS_ROLE]->(:Role)-[:HAS_PERMISSION]->(p:Permission)
RETURN DISTINCT p.name
```

## 与 Python 集成

使用官方驱动 `neo4j` 库在 Python 中操作 Neo4j：

```python
from neo4j import GraphDatabase

class Neo4jHelper:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def add_person(self, name, age):
        with self.driver.session() as session:
            session.execute_write(self._create_person, name, age)

    @staticmethod
    def _create_person(tx, name, age):
        tx.run("CREATE (p:Person {name: $name, age: $age})", name=name, age=age)

    def get_friends(self, name):
        with self.driver.session() as session:
            result = session.execute_read(self._find_friends, name)
            return [record["friend"] for record in result]

    @staticmethod
    def _find_friends(tx, name):
        result = tx.run(
            "MATCH (p:Person {name: $name})-[:KNOWS]->(f) RETURN f.name AS friend",
            name=name,
        )
        return list(result)

# 使用示例
db = Neo4jHelper("bolt://localhost:7687", "neo4j", "password")
db.add_person("张三", 28)
friends = db.get_friends("张三")
db.close()
```

安装驱动：

```bash
pip install neo4j
```

## Neo4j vs 关系型数据库

| 特性 | Neo4j | 关系型数据库（如 MySQL） |
|------|-------|------------------------|
| 数据模型 | 图（节点 + 关系） | 表格（行 + 列） |
| 关系表达 | 一等公民，直接存储 | 外键 + JOIN |
| 多跳查询 | 高效遍历，无 JOIN 开销 | 需要多表 JOIN，性能随深度下降 |
| 查询语言 | Cypher | SQL |
| 适用场景 | 关系密集型、多跳遍历 | 结构化数据、事务处理 |

## 总结

Neo4j 以图的方式建模数据，让关系查询变得直观高效。如果你的应用涉及大量的关联关系、多跳遍历或路径分析，Neo4j 是一个值得考虑的选择。上手成本低——Docker 一行命令即可启动，Cypher 语法简洁易懂，配合 Python 等语言的驱动库可以快速集成到现有项目中。

想了解更多，可以参考 [Neo4j 官方文档](https://neo4j.com/docs/)。
