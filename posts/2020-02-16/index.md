---
title: Java 連 MongoDB：Maven 管理套件與 SLF4J / Log4j2 日誌
date: 2020-02-16
category: 技術
tags: [java, maven, mongodb, logging]
summary: 用 Maven 引入 MongoDB Java Driver，並釐清 SLF4J、Logback、Log4j2 之間的關係與設定。
---

## Mongo Java Sample

- 參考：https://mongodb.github.io/mongo-java-driver/3.12/driver/getting-started/installation/
- Driver 下載位置：https://oss.sonatype.org/content/repositories/releases/org/mongodb/mongodb-driver-sync/3.12.1
  1. `mongodb-driver-core-3.12.1.jar`
  2. `mongodb-driver-sync-3.12.1.jar`
  3. `bson-3.12.1.jar`
- Logging 採用 SLF4J 機制

## Java Maven Study

透過 Maven 下載管理 Java 套件。

### 一、開始方式

**(一) Eclipse（新專案）**（以下僅限開放式開發環境）

1. 開啟新專案就引入 Maven，可參考：https://matthung0807.blogspot.com/2018/03/maven.html
2. 依上述步驟新增專案後，測試一下。以 MongoDB 為例，加入 MongoDB driver（參考上面的 installation 連結），打開 `pom.xml`，於 `dependencies` 中加入：

   ```xml
   <dependencies>
     <dependency>
       <groupId>org.mongodb</groupId>
       <artifactId>mongodb-driver-sync</artifactId>
       <version>3.12.1</version>
     </dependency>
   </dependencies>
   ```

3. 很神奇的，專案自動將 core、sync、bson 三個 jar 都下載完成了。

**(二) Eclipse（舊專案）**

於 Eclipse 的 Project Preference 點選 Configure / Convert to Maven。參考：https://www.itread01.com/content/1544752507.html

…有點麻煩，先放棄 `[TODO]`，有需要的話下次再研究。

### 二、使用方式

1. 可以到 Maven Repository 看最新版本：https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-slf4j-impl/2.13.0
2. 可以在 `pom.xml` 中維護所需版本，Eclipse 會自動下載相關的 jar 檔
3. 範例：

   ```xml
   <dependency>
     <groupId>org.apache.logging.log4j</groupId>
     <artifactId>log4j-slf4j-impl</artifactId>
     <version>2.13.0</version>
   </dependency>
   ```

   可以自行更改版本號，Eclipse 會自動去下載。

> PS. Console 應該要自己執行 Maven 相關程式吧。

---

## SLF4J (Simple Logging Facade for Java) 簡介

參考：

- https://www.ithome.com.tw/voice/117126
- https://www.liaoxuefeng.com/wiki/1252599548343744/1264739155914176

### 歷史與關係

1. **log4j** 作者是 Ceki Gülcü。過往日誌機制有 log4j、JUL（`java.util.logging`）等，後來 Apache 出了一組 Apache Commons Logging 當作入口介面，讓 AP 可以透過它切換 log4j 或 JUL。但 Commons Logging 的動態綁定規則太複雜，因此 log4j 作者又推出了 SLF4J，目的和 Commons Logging 一樣，都是提供入口介面。
2. **SLF4J** 作者也是 Ceki Gülcü。SLF4J 是一組介面，可充當 log4j 及 JUL 的介面。
3. **Logback** 作者也是 Ceki Gülcü，是一套實作 SLF4J 介面的實作。
4. log4j 後來看到 SLF4J 的發展，也在 2014 年提出 **log4j2**，將介面與實作分離為 `log4j-api`、`log4j-core`，舊 log4j 2015 年也不再出版了。

### 設定檔格式

| 套件 | 支援格式 |
| --- | --- |
| JUL | 僅支援 `.properties` |
| Log4j、Logback、Log4j2 Core | `.properties`、XML、Groovy（Logback） |
| Log4j2 | JSON，不支援 `.properties` |

### 使用方式

**(1) SLF4J**

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

private static Logger logger = LoggerFactory.getLogger(GetKOCHA.class);
```

Maven 配置：

```xml
<dependency>
  <groupId>org.apache.logging.log4j</groupId>
  <artifactId>log4j-slf4j-impl</artifactId>
  <version>2.11.0</version>
</dependency>
```

**(2) log4j2**

```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

private static Logger logger = LogManager.getLogger(GetKOCHA.class);
```

Maven 配置：

```xml
<dependency>
  <groupId>org.apache.logging.log4j</groupId>
  <artifactId>log4j-api</artifactId>
  <version>2.13.0</version>
</dependency>
<dependency>
  <groupId>org.apache.logging.log4j</groupId>
  <artifactId>log4j-core</artifactId>
  <version>2.13.0</version>
</dependency>
```

> PS. 因為 MongoDB driver 使用 SLF4J，因此如果直接用 log4j2 這套機制，MongoDB 的 log 沒辦法控制…

### 設定檔

設定檔完全可以共用上述兩種（SLF4J、log4j2）配置。

**log4j2.xml**

```xml
<Configuration status="WARN" monitorInterval="600">
  <Appenders>
    <Console name="Console" target="SYSTEM_OUT">
      <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
    </Console>
  </Appenders>
  <Loggers>
    <Root level="debug"><!-- Root is DEBUG Level -->
      <AppenderRef ref="Console"/>
    </Root>
    <Logger name="org.mongodb" level="info"><!-- MongoDB is INFO Level -->
      <AppenderRef ref="Console"/>
    </Logger>
  </Loggers>
</Configuration>
```

**log4j2.properties**

```properties
name = kocha
rootLogger.level = trace
rootLogger.appenderRef.stdout.ref = STDOUT
appender.console.type = Console
appender.console.name = STDOUT
appender.console.layout.type = PatternLayout
appender.console.layout.pattern = [%d{yyyy/MM/dd HH:mm:ss:SSS}] [%p] [%c{1}:%L] - %m%n
appender.console.filter.threshold.type = ThresholdFilter
appender.console.filter.threshold.level = info
```

### Log 模板

```java
// 舊方法：字串相加
logger.info("Insert " + list.size() + " record into OpenData DB spend time : " + (t2 - t1) + "ms");

// 新方法：{} 佔位符
logger.info("Insert {} record into {} DB spend time : {} ms",
            list.size(),
            getProperties(PROP_MONGO_DB),
            t2 - t1);
```
