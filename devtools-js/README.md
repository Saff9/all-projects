# ⚡ @saffan/devtools-js

**Tiny zero-dependency utility toolkit for Node.js developers. Stop rewriting the same helpers.**

[![npm version](https://img.shields.io/npm/v/@saffan/devtools-js.svg)](https://www.npmjs.com/package/@saffan/devtools-js)
[![npm downloads](https://img.shields.io/npm/dm/@saffan/devtools-js.svg)](https://www.npmjs.com/package/@saffan/devtools-js)
[![License](https://img.shields.io/npm/l/@saffan/devtools-js.svg)](https://github.com/saff9/devtools-js/blob/main/LICENSE)
[![Size](https://img.shields.io/bundlephobia/min/@saffan/devtools-js)](https://bundlephobia.com/result?p=@saffan/devtools-js)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![GitHub Stars](https://img.shields.io/github/stars/saff9/devtools-js.svg?style=social)](https://github.com/saff9/devtools-js)
[![Maintained](https://img.shields.io/maintenance/yes/2024.svg)](https://github.com/saff9/devtools-js)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/saff9/devtools-js/pulls)
[![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red.svg)](https://github.com/saff9/devtools-js)
[![Powered by AI](https://img.shields.io/badge/Powered%20by-AI-%23FF6B6B.svg)](https://github.com/saff9/devtools-js)

## 🚀 All-in-one Node developer toolkit

**@saffan/devtools-js** provides everything Node.js developers need daily in a single, tiny, zero-dependency package.

## ✨ Features

- ✅ **Zero dependencies** - Only uses Node.js built-ins
- ✅ **Tiny & fast** - < 20KB, optimized for performance
- ✅ **TypeScript ready** - Full type definitions included
- ✅ **ES Modules** - Modern import/export syntax
- ✅ **Production ready** - Battle-tested utilities
- ✅ **CLI included** - Use utilities from command line
- ✅ **10+ Utility Categories** - Covering all common development needs

## 📦 Installation

```bash
npm install @saffan/devtools-js
# or
yarn add @saffan/devtools-js
# or
pnpm add @saffan/devtools-js
```

## 🔧 Quick Start

```javascript
import {
  sleep, retry, uuid, logger,
  env, merge, pick, omit,
  readJSON, writeJSON, fileExists,
  timer, safeTry, asyncQueue,
  debounce, throttle, hash,
  randomString, deepClone, isEmpty
} from '@saffan/devtools-js';
```

## 📚 Complete API Reference

### 1. Array Utilities (`@saffan/devtools-js/array`)

Comprehensive array manipulation functions for data transformation, filtering, and analysis.

| Function | Description | Example |
|----------|-------------|---------|
| [`chunk()`](src/utils/array.ts#L9) | Split array into chunks | `chunk([1,2,3,4], 2) → [[1,2],[3,4]]` |
| [`flatten()`](src/utils/array.ts#L26) | Flatten nested arrays | `flatten([1,[2,[3]]]) → [1,2,3]` |
| [`unique()`](src/utils/array.ts#L46) | Remove duplicates | `unique([1,2,2,3]) → [1,2,3]` |
| [`groupBy()`](src/utils/array.ts#L59) | Group by key/function | `groupBy(['a','bb','ccc'], 'length')` |
| [`partition()`](src/utils/array.ts#L83) | Split into two groups | `partition([1,2,3], x => x % 2)` |
| [`zip()`](src/utils/array.ts#L104) | Combine arrays element-wise | `zip([1,2], ['a','b']) → [[1,'a'],[2,'b']]` |
| [`unzip()`](src/utils/array.ts#L122) | Split tuples into arrays | `unzip([[1,'a'],[2,'b']]) → [[1,2],['a','b']]` |
| [`intersection()`](src/utils/array.ts#L141) | Find common elements | `intersection([1,2,3], [2,3,4]) → [2,3]` |
| [`difference()`](src/utils/array.ts#L156) | Elements in first only | `difference([1,2,3], [2,3]) → [1]` |
| [`union()`](src/utils/array.ts#L169) | Unique elements from all | `union([1,2], [2,3]) → [1,2,3]` |
| [`sortBy()`](src/utils/array.ts#L181) | Sort by property | `sortBy(users, 'age')` |
| [`reverse()`](src/utils/array.ts#L220) | Reverse array | `reverse([1,2,3]) → [3,2,1]` |
| [`compact()`](src/utils/array.ts#L232) | Remove falsy values | `compact([0,1,false,2,'']) → [1,2]` |
| [`filterNil()`](src/utils/array.ts#L244) | Remove null/undefined | `filterNil([1,null,2]) → [1,2]` |
| [`drop()`](src/utils/array.ts#L257) | Remove first n elements | `drop([1,2,3,4], 2) → [3,4]` |
| [`take()`](src/utils/array.ts#L270) | Get first n elements | `take([1,2,3,4], 2) → [1,2]` |
| [`sliceAfter()`](src/utils/array.ts#L283) | Get elements after match | `sliceAfter([1,2,3,4], x => x === 2) → [3,4]` |
| [`sliceBefore()`](src/utils/array.ts#L297) | Get elements before match | `sliceBefore([1,2,3,4], x => x === 3) → [1,2]` |
| [`findLast()`](src/utils/array.ts#L311) | Find last matching | `findLast([1,2,3,2], x => x === 2) → 2` |
| [`findIndexLast()`](src/utils/array.ts#L330) | Find last index | `findIndexLast([1,2,3,2], x => x === 2) → 3` |
| [`includes()`](src/utils/array.ts#L349) | Check inclusion | `includes([1,2,3], 2) → true` |
| [`indexOfAll()`](src/utils/array.ts#L362) | All indices of value | `indexOfAll([1,2,2,3], 2) → [1,2]` |
| [`mapValues()`](src/utils/array.ts#L379) | Map with index | `mapValues([1,2,3], (v,i) => v+i)` |
| [`flatMap()`](src/utils/array.ts#L395) | Flatten after map | `flatMap([1,2], x => [x,x*2]) → [1,2,2,4]` |
| [`reduceRight()`](src/utils/array.ts#L412) | Reduce right-to-left | `reduceRight([1,2,3], (a,b) => a+b, 0)` |
| [`zipWith()`](src/utils/array.ts#L433) | Zip with function | `zipWith([[1,2],[3,4]], (a,b) => a+b)` |
| [`sum()`](src/utils/array.ts#L453) | Sum of numbers | `sum([1,2,3,4]) → 10` |
| [`mean()`](src/utils/array.ts#L465) | Average of numbers | `mean([1,2,3,4]) → 2.5` |
| [`min()`](src/utils/array.ts#L477) | Minimum value | `min([3,1,4,2]) → 1` |
| [`max()`](src/utils/array.ts#L489) | Maximum value | `max([3,1,4,2]) → 4` |
| [`range()`](src/utils/array.ts#L500) | Generate range | `range(1, 5) → [1,2,3,4,5]` |
| [`repeat()`](src/utils/array.ts#L512) | Repeat array | `repeat([1,2], 3) → [1,2,1,2,1,2]` |
| [`isEmpty()`](src/utils/array.ts#L524) | Check if empty | `isEmpty([]) → true` |
| [`size()`](src/utils/array.ts#L537) | Get array size | `size([1,2,3]) → 3` |
| [`isArray()`](src/utils/array.ts#L550) | Type guard | `isArray([]) → true` |
| [`shuffle()`](src/utils/array.ts#L203) | Random shuffle | `shuffle([1,2,3,4])` |

---

### 2. Math Utilities (`@saffan/devtools-js/math`)

Mathematical constants, operations, statistics, and random number generation.

#### Constants
| Constant | Description | Value |
|----------|-------------|-------|
| [`PI`](src/utils/math.ts#L11) | Circle constant | `3.14159...` |
| [`E`](src/utils/math.ts#L14) | Euler's number | `2.71828...` |
| [`TAU`](src/utils/math.ts#L17) | 2π (circle constant) | `6.28318...` |
| [`INFINITY`](src/utils/math.ts#L20) | Positive infinity | `Infinity` |
| [`NEGATIVE_INFINITY`](src/utils/math.ts#L23) | Negative infinity | `-Infinity` |

#### Basic Operations
| Function | Description | Example |
|----------|-------------|---------|
| [`add()`](src/utils/math.ts#L81) | Add two numbers | `add(2, 3) → 5` |
| [`subtract()`](src/utils/math.ts#L93) | Subtract b from a | `subtract(5, 3) → 2` |
| [`multiply()`](src/utils/math.ts#L105) | Multiply numbers | `multiply(4, 5) → 20` |
| [`divide()`](src/utils/math.ts#L117) | Divide with check | `divide(10, 2) → 5` |
| [`modulo()`](src/utils/math.ts#L133) | Remainder | `modulo(10, 3) → 1` |
| [`power()`](src/utils/math.ts#L149) | Exponentiation | `power(2, 3) → 8` |
| [`sqrt()`](src/utils/math.ts#L160) | Square root | `sqrt(16) → 4` |
| [`root()`](src/utils/math.ts#L176) | nth root | `root(8, 3) → 2` |
| [`factorial()`](src/utils/math.ts#L196) | Factorial (bigint support) | `factorial(5) → 120` |

#### Clamping & Limiting
| Function | Description | Example |
|----------|-------------|---------|
| [`clamp()`](src/utils/math.ts#L229) | Constrain to range | `clamp(15, 0, 10) → 10` |
| [`mapRange()`](src/utils/math.ts#L244) | Map between ranges | `mapRange(50, 0, 100, 0, 1) → 0.5` |
| [`limit()`](src/utils/math.ts#L262) | Upper bound limit | `limit(15, 10) → 10` |
| [`floor()`](src/utils/math.ts#L274) | Floor to decimals | `floor(3.456, 2) → 3.45` |
| [`ceil()`](src/utils/math.ts#L287) | Ceil to decimals | `ceil(3.123, 2) → 3.13` |
| [`round()`](src/utils/math.ts#L300) | Round to decimals | `round(3.456, 2) → 3.46` |
| [`truncate()`](src/utils/math.ts#L313) | Truncate decimals | `truncate(3.456, 2) → 3.45` |

#### Statistics
| Function | Description | Example |
|----------|-------------|---------|
| [`sum()`](src/utils/math.ts#L329) | Sum of numbers | `sum(1,2,3,4) → 10` |
| [`product()`](src/utils/math.ts#L340) | Product of numbers | `product(2,3,4) → 24` |
| [`mean()`](src/utils/math.ts#L352) | Arithmetic mean | `mean(1,2,3,4) → 2.5` |
| [`median()`](src/utils/math.ts#L364) | Median value | `median(1,3,5) → 3` |
| [`mode()`](src/utils/math.ts#L382) | Most frequent value | `mode(1,2,2,3) → 2` |
| [`variance()`](src/utils/math.ts#L410) | Statistical variance | `variance(1,2,3,4)` |
| [`standardDeviation()`](src/utils/math.ts#L425) | Standard deviation | `standardDeviation(1,2,3,4)` |
| [`harmonicMean()`](src/utils/math.ts#L436) | Harmonic mean | `harmonicMean(2,4) → 2.67` |
| [`geometricMean()`](src/utils/math.ts#L451) | Geometric mean | `geometricMean(2,4,8) → 4` |

#### Min/Max & Random
| Function | Description | Example |
|----------|-------------|---------|
| [`min()`](src/utils/math.ts#L470) | Minimum value | `min(1,2,3,4) → 1` |
| [`max()`](src/utils/math.ts#L482) | Maximum value | `max(1,2,3,4) → 4` |
| [`range()`](src/utils/math.ts#L494) | Max minus min | `range(1,2,3,4) → 3` |
| [`percentile()`](src/utils/math.ts#L506) | pth percentile | `percentile([1,2,3,4,5], 90) → 4.5` |
| [`quantile()`](src/utils/math.ts#L521) | Quantile values | `quantile([1,2,3,4,5], 0.5) → 3` |
| [`random()`](src/utils/math.ts#L536) | Random float 0-1 | `random() → 0.456` |
| [`randomInt()`](src/utils/math.ts#L548) | Random integer | `randomInt(1, 100) → 42` |
| [`randomFloat()`](src/utils/math.ts#L560) | Random float in range | `randomFloat(1.5, 3.5)` |
| [`randomBool()`](src/utils/math.ts#L572) | Random boolean | `randomBool() → true/false` |
| [`randomItem()`](src/utils/math.ts#L584) | Random array item | `randomItem([1,2,3]) → 2` |
| [`shuffle()`](src/utils/math.ts#L596) | Fisher-Yates shuffle | `shuffle([1,2,3,4])` |
| [`weightedRandom()`](src/utils/math.ts#L616) | Weighted selection | `weightedRandom([{v:1,w:1},{v:2,w:3}])` |
| [`gaussianRandom()`](src/utils/math.ts#L636) | Normal distribution | `gaussianRandom()` |
| [`randomString()`](src/utils/math.ts#L655) | Random alphanumeric | `randomString(16)` |
| [`randomBytes()`](src/utils/math.ts#L673) | Random bytes | `randomBytes(32)` |

#### Number Theory
| Function | Description | Example |
|----------|-------------|---------|
| [`gcd()`](src/utils/math.ts#L696) | Greatest common divisor | `gcd(12, 18) → 6` |
| [`lcm()`](src/utils/math.ts#L718) | Least common multiple | `lcm(4, 6) → 12` |
| [`isEven()`](src/utils/math.ts#L740) | Check even | `isEven(4) → true` |
| [`isOdd()`](src/utils/math.ts#L752) | Check odd | `isOdd(4) → false` |
| [`isPrime()`](src/utils/math.ts#L764) | Check prime | `isPrime(17) → true` |
| [`isPerfectSquare()`](src/utils/math.ts#L788) | Check square number | `isPerfectSquare(16) → true` |
| [`isPowerOfTwo()`](src/utils/math.ts#L800) | Check power of 2 | `isPowerOfTwo(8) → true` |
| [`nextPowerOfTwo()`](src/utils/math.ts#L812) | Next power of 2 | `nextPowerOfTwo(10) → 16` |
| [`primeFactors()`](src/utils/math.ts#L824) | Prime factorization | `primeFactors(12) → [2,2,3]` |

#### Trigonometry
| Function | Description | Example |
|----------|-------------|---------|
| [`degToRad()`](src/utils/math.ts#L847) | Degrees to radians | `degToRad(180) → π` |
| [`radToDeg()`](src/utils/math.ts#L859) | Radians to degrees | `radToDeg(π) → 180` |
| [`sin()`](src/utils/math.ts#L871) | Sine | `sin(Math.PI/2) → 1` |
| [`cos()`](src/utils/math.ts#L883) | Cosine | `cos(0) → 1` |
| [`tan()`](src/utils/math.ts#L895) | Tangent | `tan(0) → 0` |
| [`asin()`](src/utils/math.ts#L907) | Arc sine | `asin(1) → π/2` |
| [`acos()`](src/utils/math.ts#L919) | Arc cosine | `acos(1) → 0` |
| [`atan()`](src/utils/math.ts#L931) | Arc tangent | `atan(1) → π/4` |
| [`atan2()`](src/utils/math.ts#L943) | Arc tangent 2 | `atan2(1, 1) → π/4` |

#### Formatting
| Function | Description | Example |
|----------|-------------|---------|
| [`formatNumber()`](src/utils/math.ts#L956) | Format with options | `formatNumber(1234.567, 2)` |
| [`formatCurrency()`](src/utils/math.ts#L978) | Format as currency | `formatCurrency(1234.56, 'USD')` |
| [`formatPercent()`](src/utils/math.ts#L1000) | Format as percent | `formatPercent(0.4567)` |
| [`formatCompact()`](src/utils/math.ts#L1022) | Compact notation | `formatCompact(1500000) → '1.5M'` |
| [`formatBytes()`](src/utils/math.ts#L1044) | Format bytes | `formatBytes(1048576) → '1 MB'` |

---

### 3. Date Utilities (`@saffan/devtools-js/date`)

Comprehensive date manipulation, comparison, formatting, and timezone handling.

#### Date Creation
| Function | Description | Example |
|----------|-------------|---------|
| [`now()`](src/utils/date.ts#L185) | Current date | `now()` |
| [`unix()`](src/utils/date.ts#L195) | Unix timestamp (seconds) | `unix()` |
| [`unixMs()`](src/utils/date.ts#L205) | Unix timestamp (ms) | `unixMs()` |
| [`create()`](src/utils/date.ts#L222) | Create from components | `create(2024, 0, 15, 10, 30)` |
| [`fromUnix()`](src/utils/date.ts#L241) | From Unix timestamp | `fromUnix(1705315200)` |
| [`fromIso()`](src/utils/date.ts#L254) | From ISO string | `fromIso('2024-01-15')` |
| [`fromFormat()`](src/utils/date.ts#L267) | From custom format | `fromFormat('15/01/2024', 'DD/MM/YYYY')` |

#### Addition/Subtraction
| Function | Description | Example |
|----------|-------------|---------|
| [`addDays()`](src/utils/date.ts#L364) | Add days | `addDays(now(), 7)` |
| [`subDays()`](src/utils/date.ts#L380) | Subtract days | `subDays(now(), 3)` |
| [`addHours()`](src/utils/date.ts#L392) | Add hours | `addHours(now(), 2)` |
| [`subHours()`](src/utils/date.ts#L408) | Subtract hours | `subHours(now(), 1)` |
| [`addMinutes()`](src/utils/date.ts#L420) | Add minutes | `addMinutes(now(), 30)` |
| [`subMinutes()`](src/utils/date.ts#L436) | Subtract minutes | `subMinutes(now(), 15)` |
| [`addSeconds()`](src/utils/date.ts#L448) | Add seconds | `addSeconds(now(), 60)` |
| [`subSeconds()`](src/utils/date.ts#L464) | Subtract seconds | `subSeconds(now(), 30)` |
| [`addMonths()`](src/utils/date.ts#L476) | Add months | `addMonths(now(), 1)` |
| [`subMonths()`](src/utils/date.ts#L500) | Subtract months | `subMonths(now(), 6)` |
| [`addYears()`](src/utils/date.ts#L511) | Add years | `addYears(now(), 1)` |
| [`subYears()`](src/utils/date.ts#L527) | Subtract years | `subYears(now(), 5)` |

#### Start/End
| Function | Description | Example |
|----------|-------------|---------|
| [`startOfDay()`](src/utils/date.ts#L542) | Beginning of day | `startOfDay(now())` |
| [`endOfDay()`](src/utils/date.ts#L555) | End of day | `endOfDay(now())` |
| [`startOfWeek()`](src/utils/date.ts#L569) | Start of week | `startOfWeek(now())` |
| [`endOfWeek()`](src/utils/date.ts#L588) | End of week | `endOfWeek(now())` |
| [`startOfMonth()`](src/utils/date.ts#L606) | Start of month | `startOfMonth(now())` |
| [`endOfMonth()`](src/utils/date.ts#L619) | End of month | `endOfMonth(now())` |
| [`startOfQuarter()`](src/utils/date.ts#L633) | Start of quarter | `startOfQuarter(now())` |
| [`endOfQuarter()`](src/utils/date.ts#L648) | End of quarter | `endOfQuarter(now())` |
| [`startOfYear()`](src/utils/date.ts#L663) | Start of year | `startOfYear(now())` |
| [`endOfYear()`](src/utils/date.ts#L676) | End of year | `endOfYear(now())` |

#### Comparison
| Function | Description | Example |
|----------|-------------|---------|
| [`isSameDay()`](src/utils/date.ts#L694) | Same day? | `isSameDay(d1, d2)` |
| [`isSameMonth()`](src/utils/date.ts#L713) | Same month? | `isSameMonth(d1, d2)` |
| [`isSameYear()`](src/utils/date.ts#L728) | Same year? | `isSameYear(d1, d2)` |
| [`isBefore()`](src/utils/date.ts#L743) | d1 before d2? | `isBefore(d1, d2)` |
| [`isAfter()`](src/utils/date.ts#L758) | d1 after d2? | `isAfter(d1, d2)` |
| [`isBetween()`](src/utils/date.ts#L774) | In range? | `isBetween(d, start, end)` |
| [`isToday()`](src/utils/date.ts#L793) | Is today? | `isToday(date)` |
| [`isYesterday()`](src/utils/date.ts#L806) | Is yesterday? | `isYesterday(date)` |
| [`isTomorrow()`](src/utils/date.ts#L821) | Is tomorrow? | `isTomorrow(date)` |
| [`isPast()`](src/utils/date.ts#L836) | In past? | `isPast(date)` |
| [`isFuture()`](src/utils/date.ts#L849) | In future? | `isFuture(date)` |
| [`isLeapYear()`](src/utils/date.ts#L862) | Leap year? | `isLeapYear(date)` |
| [`isValid()`](src/utils/date.ts#L875) | Valid date? | `isValid(date)` |

#### Difference
| Function | Description | Example |
|----------|-------------|---------|
| [`diffMs()`](src/utils/date.ts#L891) | Difference in ms | `diffMs(d1, d2)` |
| [`diffSeconds()`](src/utils/date.ts#L906) | Difference in seconds | `diffSeconds(d1, d2)` |
| [`diffMinutes()`](src/utils/date.ts#L920) | Difference in minutes | `diffMinutes(d1, d2)` |
| [`diffHours()`](src/utils/date.ts#L934) | Difference in hours | `diffHours(d1, d2)` |
| [`diffDays()`](src/utils/date.ts#L948) | Difference in days | `diffDays(d1, d2)` |
| [`diffWeeks()`](src/utils/date.ts#L966) | Difference in weeks | `diffWeeks(d1, d2)` |
| [`diffMonths()`](src/utils/date.ts#L980) | Difference in months | `diffMonths(d1, d2)` |
| [`diffYears()`](src/utils/date.ts#L997) | Difference in years | `diffYears(d1, d2)` |

#### Formatting
| Function | Description | Example |
|----------|-------------|---------|
| [`format()`](src/utils/date.ts#L1017) | Custom format | `format(date, 'YYYY-MM-DD')` |
| [`formatIso()`](src/utils/date.ts#L1085) | ISO string | `formatIso(date)` |
| [`formatDate()`](src/utils/date.ts#L1098) | YYYY-MM-DD | `formatDate(date)` |
| [`formatTime()`](src/utils/date.ts#L1109) | HH:mm:ss | `formatTime(date)` |
| [`formatDateTime()`](src/utils/date.ts#L1120) | Full datetime | `formatDateTime(date)` |
| [`formatRelative()`](src/utils/date.ts#L1132) | Relative time | `formatRelative(date)` |
| [`formatLocale()`](src/utils/date.ts#L1181) | Locale-aware | `formatLocale(date, 'fr-FR')` |
| [`timeAgo()`](src/utils/date.ts#L1208) | "2 hours ago" | `timeAgo(date)` |
| [`timeUntil()`](src/utils/date.ts#L1252) | "in 3 days" | `timeUntil(date)` |

#### Components
| Function | Description | Example |
|----------|-------------|---------|
| [`getYear()`](src/utils/date.ts#L1304) | Get year | `getYear(date)` |
| [`getMonth()`](src/utils/date.ts#L1317) | Get month (0-11) | `getMonth(date)` |
| [`getDay()`](src/utils/date.ts#L1330) | Get day (1-31) | `getDay(date)` |
| [`getDayOfWeek()`](src/utils/date.ts#L1343) | Day of week (0-6) | `getDayOfWeek(date)` |
| [`getDayOfYear()`](src/utils/date.ts#L1356) | Day of year | `getDayOfYear(date)` |
| [`getHour()`](src/utils/date.ts#L1372) | Get hour (0-23) | `getHour(date)` |
| [`getMinute()`](src/utils/date.ts#L1385) | Get minute (0-59) | `getMinute(date)` |
| [`getSecond()`](src/utils/date.ts#L1398) | Get second (0-59) | `getSecond(date)` |
| [`getMillisecond()`](src/utils/date.ts#L1411) | Get milliseconds | `getMillisecond(date)` |
| [`getQuarter()`](src/utils/date.ts#L1424) | Get quarter (1-4) | `getQuarter(date)` |
| [`getWeek()`](src/utils/date.ts#L1437) | ISO week number | `getWeek(date)` |
| [`getDaysInMonth()`](src/utils/date.ts#L1477) | Days in month | `getDaysInMonth(date)` |
| [`getDaysInYear()`](src/utils/date.ts#L1490) | Days in year | `getDaysInYear(date)` |
| [`toUnixTimestamp()`](src/utils/date.ts#L1503) | Unix timestamp | `toUnixTimestamp(date)` |

#### Setting
| Function | Description | Example |
|----------|-------------|---------|
| [`setYear()`](src/utils/date.ts#L1521) | Set year | `setYear(date, 2025)` |
| [`setMonth()`](src/utils/date.ts#L1537) | Set month | `setMonth(date, 5)` |
| [`setDay()`](src/utils/date.ts#L1553) | Set day | `setDay(date, 15)` |
| [`setHour()`](src/utils/date.ts#L1569) | Set hour | `setHour(date, 12)` |
| [`setMinute()`](src/utils/date.ts#L1585) | Set minute | `setMinute(date, 30)` |
| [`setSecond()`](src/utils/date.ts#L1601) | Set second | `setSecond(date, 0)` |

---

### 4. URL Utilities (`@saffan/devtools-js/url`)

URL parsing, manipulation, validation, and encoding for web development.

#### Parsing
| Function | Description | Example |
|----------|-------------|---------|
| [`parse()`](src/utils/url.ts#L98) | Parse all components | `parse('https://example.com/path')` |
| [`getProtocol()`](src/utils/url.ts#L122) | Get protocol | `getProtocol(url)` |
| [`getDomain()`](src/utils/url.ts#L134) | Get main domain | `getDomain('https://sub.example.com')` |
| [`getHostname()`](src/utils/url.ts#L163) | Get full hostname | `getHostname(url)` |
| [`getPort()`](src/utils/url.ts#L174) | Get port | `getPort(url)` |
| [`getPath()`](src/utils/url.ts#L185) | Get pathname | `getPath(url)` |
| [`getQuery()`](src/utils/url.ts#L207) | Get query string | `getQuery(url)` |
| [`getQueryParams()`](src/utils/url.ts#L218) | Get params object | `getQueryParams(url)` |
| [`getHash()`](src/utils/url.ts#L237) | Get hash | `getHash(url)` |
| [`getSearch()`](src/utils/url.ts#L248) | Get search string | `getSearch(url)` |
| [`getOrigin()`](src/utils/url.ts#L259) | Get origin | `getOrigin(url)` |
| [`getHref()`](src/utils/url.ts#L270) | Get full URL | `getHref(url)` |

#### Query String
| Function | Description | Example |
|----------|-------------|---------|
| [`addQueryParam()`](src/utils/url.ts#L287) | Add/update param | `addQueryParam(url, 'page', 2)` |
| [`addQueryParams()`](src/utils/url.ts#L303) | Add/update multiple | `addQueryParams(url, {page:1,limit:10})` |
| [`removeQueryParam()`](src/utils/url.ts#L324) | Remove param | `removeQueryParam(url, 'page')` |
| [`removeQueryParams()`](src/utils/url.ts#L340) | Remove multiple | `removeQueryParams(url, ['page','limit'])` |
| [`getQueryParam()`](src/utils/url.ts#L381) | Get single param | `getQueryParam(url, 'id')` |
| [`hasQueryParam()`](src/utils/url.ts#L398) | Check param exists | `hasQueryParam(url, 'id')` |
| [`buildQuery()`](src/utils/url.ts#L412) | Build query string | `buildQuery({a:1,b:2})` |
| [`parseQuery()`](src/utils/url.ts#L432) | Parse query string | `parseQuery('a=1&b=2')` |

#### Validation
| Function | Description | Example |
|----------|-------------|---------|
| [`isValidUrl()`](src/utils/url.ts#L458) | Valid URL? | `isValidUrl(str)` |
| [`isAbsoluteUrl()`](src/utils/url.ts#L469) | Absolute URL? | `isAbsoluteUrl(url)` |
| [`isRelativeUrl()`](src/utils/url.ts#L483) | Relative URL? | `isRelativeUrl(url)` |
| [`isSameOrigin()`](src/utils/url.ts#L495) | Same origin? | `isSameOrigin(url1, url2)` |
| [`isSubdomain()`](src/utils/url.ts#L516) | Is subdomain? | `isSubdomain('sub.example.com', 'example.com')` |
| [`isInternalLink()`](src/utils/url.ts#L536) | Internal link? | `isInternalLink(url, base)` |
| [`isExternalLink()`](src/utils/url.ts#L557) | External link? | `isExternalLink(url, base)` |
| [`isSecure()`](src/utils/url.ts#L568) | HTTPS? | `isSecure(url)` |
| [`isHttp()`](src/utils/url.ts#L580) | HTTP? | `isHttp(url)` |
| [`isDataUrl()`](src/utils/url.ts#L592) | Data URL? | `isDataUrl(url)` |
| [`isMailto()`](src/utils/url.ts#L603) | Mailto link? | `isMailto(url)` |
| [`isTel()`](src/utils/url.ts#L614) | Tel link? | `isTel(url)` |
| [`isBlobUrl()`](src/utils/url.ts#L625) | Blob URL? | `isBlobUrl(url)` |

#### Resolution
| Function | Description | Example |
|----------|-------------|---------|
| [`resolveUrl()`](src/utils/url.ts#L641) | Resolve relative | `resolveUrl(base, relative)` |
| [`normalizeUrl()`](src/utils/url.ts#L656) | Normalize URL | `normalizeUrl(url)` |
| [`resolvePath()`](src/utils/url.ts#L680) | Resolve path | `resolvePath(base, relative)` |
| [`joinPath()`](src/utils/url.ts#L693) | Join paths | `joinPath('a', 'b', 'c')` |
| [`basename()`](src/utils/url.ts#L707) | Get filename | `basename('/path/to/file.txt')` |
| [`dirname()`](src/utils/url.ts#L722) | Get directory | `dirname('/path/to/file.txt')` |
| [`extname()`](src/utils/url.ts#L738) | Get extension | `extname('/path/to/file.txt')` |
| [`resolve()`](src/utils/url.ts#L753) | Resolve absolute | `resolve(base, 'path')` |
| [`relative()`](src/utils/url.ts#L777) | Get relative path | `relative(from, to)` |

#### Encoding
| Function | Description | Example |
|----------|-------------|---------|
| [`encodeURI()`](src/utils/url.ts#L830) | Encode URI | `encodeURI(str)` |
| [`decodeURI()`](src/utils/url.ts#L841) | Decode URI | `decodeURI(str)` |
| [`encodeURIComponent()`](src/utils/url.ts#L852) | Encode component | `encodeURIComponent(str)` |
| [`decodeURIComponent()`](src/utils/url.ts#L863) | Decode component | `decodeURIComponent(str)` |
| [`encodeSpecialChars()`](src/utils/url.ts#L874) | HTML encode | `encodeSpecialChars('<div>')` |
| [`decodeSpecialChars()`](src/utils/url.ts#L891) | HTML decode | `decodeSpecialChars('<div>')` |

#### Formatting
| Function | Description | Example |
|----------|-------------|---------|
| [`buildUrl()`](src/utils/url.ts#L916) | Build URL | `buildUrl('https', 'example.com', '/api')` |
| [`buildSecureUrl()`](src/utils/url.ts#L956) | Build HTTPS URL | `buildSecureUrl('example.com', '/api')` |
| [`withProtocol()`](src/utils/url.ts#L973) | Change protocol | `withProtocol(url, 'https')` |
| [`withHost()`](src/utils/url.ts#L994) | Change host | `withHost(url, 'new.com')` |
| [`withPort()`](src/utils/url.ts#L1016) | Change port | `withPort(url, 8080)` |
| [`withPath()`](src/utils/url.ts#L1038) | Change path | `withPath(url, '/new/path')` |
| [`withQuery()`](src/utils/url.ts#L1059) | Set query | `withQuery(url, 'a=1')` |
| [`withHash()`](src/utils/url.ts#L1088) | Set hash | `withHash(url, 'section')` |

---

### 5. CLI Utilities (`@saffan/devtools-js/cli`)

Command-line interface tools for building CLIs, argument parsing, and interactive prompts.

#### Argument Parsing
| Function | Description | Example |
|----------|-------------|---------|
| [`getArgs()`](src/utils/cli.ts#L166) | Get all args | `getArgs()` |
| [`getFlags()`](src/utils/cli.ts#L182) | Parse flags | `getFlags()` |
| [`parseArgs()`](src/utils/cli.ts#L235) | Parse with options | `parseArgs(args, options)` |
| [`parseFlags()`](src/utils/cli.ts#L305) | Parse flags only | `parseFlags(args)` |
| [`getFirstArg()`](src/utils/cli.ts#L335) | First non-flag arg | `getFirstArg()` |
| [`getLastArg()`](src/utils/cli.ts#L350) | Last non-flag arg | `getLastArg()` |
| [`hasFlag()`](src/utils/cli.ts#L367) | Check flag exists | `hasFlag(args, 'verbose')` |
| [`getFlagValue()`](src/utils/cli.ts#L385) | Get flag value | `getFlagValue(args, 'port')` |
| [`removeFlag()`](src/utils/cli.ts#L416) | Remove flag | `removeFlag(args, 'verbose')` |
| [`extractFlags()`](src/utils/cli.ts#L452) | Extract all flags | `extractFlags(args)` |
| [`extractOptions()`](src/utils/cli.ts#L496) | Extract positional | `extractOptions(args)` |

#### Command Execution
| Function | Description | Example |
|----------|-------------|---------|
| [`exec()`](src/utils/cli.ts#L516) | Execute sync | `exec('ls -la')` |
| [`execAsync()`](src/utils/cli.ts#L560) | Execute async | `execAsync('npm run build')` |
| [`spawn()`](src/utils/cli.ts#L638) | Spawn process | `spawn('npm', ['run','build'])` |
| [`spawnAsync()`](src/utils/cli.ts#L668) | Spawn async | `spawnAsync('npm', ['install'])` |
| [`runScript()`](src/utils/cli.ts#L701) | Run Node script | `runScript('./build.js')` |
| [`runCommand()`](src/utils/cli.ts#L719) | Run in directory | `runCommand('npm test', '/project')` |

#### Interactive Prompts
| Function | Description | Example |
|----------|-------------|---------|
| [`prompt()`](src/utils/cli.ts#L738) | Get user input | `await prompt('Name?')` |
| [`confirm()`](src/utils/cli.ts#L780) | Yes/no confirm | `await confirm('Delete?')` |
| [`select()`](src/utils/cli.ts#L803) | Select option | `await select('Color?', options)` |
| [`checkbox()`](src/utils/cli.ts#L853) | Multi-select | `await checkbox('Items?', options)` |
| [`password()`](src/utils/cli.ts#L884) | Hidden input | `await password('Password:')` |
| [`editor()`](src/utils/cli.ts#L916) | Open editor | `await editor('Message:')` |
| [`list()`](src/utils/cli.ts#L968) | List input | `await list('Tags:', ',')` |
| [`expand()`](src/utils/cli.ts#L990) | Expand/collapse | `await expand('View:', options)` |

#### Output & Display
| Function | Description | Example |
|----------|-------------|---------|
| [`print()`](src/utils/cli.ts#L1029) | Print message | `print('text', {newline:false})` |
| [`println()`](src/utils/cli.ts#L1045) | Print line | `println('Hello')` |
| [`log()`](src/utils/cli.ts#L1060) | Log with level | `log('message', 'info')` |
| [`success()`](src/utils/cli.ts#L1082) | Success message | `success('Done!')` |
| [`error()`](src/utils/cli.ts#L1095) | Error message | `error('Failed!')` |
| [`warn()`](src/utils/cli.ts#L1108) | Warning | `warn('Check...')` |
| [`info()`](src/utils/cli.ts#L1121) | Info message | `info('Starting...')` |
| [`debug()`](src/utils/cli.ts#L1134) | Debug message | `debug('var:', value)` |
| [`table()`](src/utils/cli.ts#L1150) | Display table | `table(data, columns)` |
| [`tree()`](src/utils/cli.ts#L1190) | Display tree | `tree(data)` |
| [`progress()`](src/utils/cli.ts#L1219) | Show progress | `progress(50, 100)` |
| [`spinner()`](src/utils/cli.ts#L1250) | Show spinner | `spinner('Loading...')` |

#### Colors & Styling
| Function | Description | Example |
|----------|-------------|---------|
| [`color()`](src/utils/cli.ts#L1300) | Apply color | `color('text', 'red')` |
| [`bgColor()`](src/utils/cli.ts#L1320) | Background color | `bgColor('text', 'blue')` |
| [`bold()`](src/utils/cli.ts#L1340) | Bold text | `bold('text')` |
| [`italic()`](src/utils/cli.ts#L1360) | Italic text | `italic('text')` |
| [`underline()`](src/utils/cli.ts#L1380) | Underline | `underline('text')` |

#### Progress & Loading
| Function | Description | Example |
|----------|-------------|---------|
| [`createProgressBar()`](src/utils/cli.ts#L1400) | Create progress bar | `createProgressBar(options)` |
| [`createMultiBar()`](src/utils/cli.ts#L1430) | Create multi-bar | `createMultiBar()` |
| [`createSpinner()`](src/utils/cli.ts#L1460) | Create spinner | `createSpinner(options)` |

#### CLI Utilities
| Function | Description | Example |
|----------|-------------|---------|
| [`getCliName()`](src/utils/cli.ts#L1500) | Get CLI name | `getCliName()` |
| [`getCliVersion()`](src/utils/cli.ts#L1510) | Get version | `getCliVersion()` |
| [`getCliArgs()`](src/utils/cli.ts#L1520) | Get CLI args | `getCliArgs()` |
| [`isInteractive()`](src/utils/cli.ts#L1530) | TTY interactive? | `isInteractive()` |
| [`isCI()`](src/utils/cli.ts#L1540) | CI environment? | `isCI()` |
| [`getTerminalSize()`](src/utils/cli.ts#L1550) | Terminal size | `getTerminalSize()` |

---

### 6. System Utilities (`@saffan/devtools-js/system`)

Node.js system utilities for process management, port handling, and system information.

#### Port Management
| Function | Description | Example |
|----------|-------------|---------|
| [`getFreePort()`](src/utils/system.ts#L218) | Get random free port | `getFreePort()` |
| [`getFreePortRange()`](src/utils/system.ts#L235) | Get port range | `getFreePortRange(3000, 5)` |
| [`isPortInUse()`](src/utils/system.ts#L270) | Check port status | `await isPortInUse(3000)` |
| [`checkPort()`](src/utils/system.ts#L297) | Detailed check | `await checkPort(3000)` |
| [`waitForPort()`](src/utils/system.ts#L333) | Wait for availability | `await waitForPort(3000)` |
| [`killPort()`](src/utils/system.ts#L362) | Kill process on port | `await killPort(3000)` |
| [`getPortPid()`](src/utils/system.ts#L386) | Get PID using port | `await getPortPid(3000)` |
| [`allocatePort()`](src/utils/system.ts#L485) | Allocate preferred port | `await allocatePort(3000)` |

#### Process Information
| Function | Description | Example |
|----------|-------------|---------|
| [`getProcessId()`](src/utils/system.ts#L520) | Get current PID | `getProcessId()` |
| [`getProcessInfo()`](src/utils/system.ts#L535) | Get process details | `getProcessInfo()` |
| [`getProcessUptime()`](src/utils/system.ts#L560) | Get uptime | `getProcessUptime()` |
| [`getProcessMemoryUsage()`](src/utils/system.ts#L575) | Memory usage | `getProcessMemoryUsage()` |
| [`getProcessCpuUsage()`](src/utils/system.ts#L595) | CPU usage | `getProcessCpuUsage()` |

#### System Information
| Function | Description | Example |
|----------|-------------|---------|
| [`getOsInfo()`](src/utils/system.ts#L615) | Get OS info | `getOsInfo()` |
| [`getOsPlatform()`](src/utils/system.ts#L640) | Get platform | `getOsPlatform()` |
| [`getOsArch()`](src/utils/system.ts#L650) | Get architecture | `getOsArch()` |
| [`getOsVersion()`](src/utils/system.ts#L660) | Get OS version | `getOsVersion()` |
| [`getOsHostname()`](src/utils/system.ts#L670) | Get hostname | `getOsHostname()` |
| [`getOsTotalMem()`](src/utils/system.ts#L680) | Total memory | `getOsTotalMem()` |
| [`getOsFreeMem()`](src/utils/system.ts#L690) | Free memory | `getOsFreeMem()` |
| [`getOsCpus()`](src/utils/system.ts#L700) | CPU info | `getOsCpus()` |
| [`getOsUserInfo()`](src/utils/system.ts#L715) | User info | `getOsUserInfo()` |
| [`getOsLoadAvg()`](src/utils/system.ts#L730) | Load averages | `getOsLoadAvg()` |

#### Memory Management
| Function | Description | Example |
|----------|-------------|---------|
| [`getMemoryUsage()`](src/utils/system.ts#L745) | Process memory | `getMemoryUsage()` |
| [`getHeapUsed()`](src/utils/system.ts#L765) | Heap used | `getHeapUsed()` |
| [`getHeapTotal()`](src/utils/system.ts#L775) | Heap total | `getHeapTotal()` |
| [`forceGc()`](src/utils/system.ts#L785) | Force GC | `forceGc()` |
| [`monitorMemory()`](src/utils/system.ts#L795) | Monitor memory | `monitorMemory()` |

#### CPU Management
| Function | Description | Example |
|----------|-------------|---------|
| [`getCpuUsage()`](src/utils/system.ts#L820) | CPU usage | `getCpuUsage()` |
| [`getCpuInfo()`](src/utils/system.ts#L840) | CPU info | `getCpuInfo()` |
| [`getCpuCount()`](src/utils/system.ts#L855) | CPU core count | `getCpuCount()` |
| [`monitorCpu()`](src/utils/system.ts#L865) | Monitor CPU | `monitorCpu()` |

---

### 7. File System Utilities (`@saffan/devtools-js/fs`)

Comprehensive file operations including reading, writing, directory management, and file utilities.

#### File Reading
| Function | Description | Example |
|----------|-------------|---------|
| [`readFile()`](src/utils/fs.ts#L154) | Read file async | `await readFile('file.txt')` |
| [`readFileSync()`](src/utils/fs.ts#L164) | Read file sync | `readFileSync('file.txt')` |
| [`readBuffer()`](src/utils/fs.ts#L173) | Read as buffer | `await readBuffer('file.bin')` |
| [`readJson()`](src/utils/fs.ts#L182) | Read JSON | `await readJson('config.json')` |
| [`readJsonSync()`](src/utils/fs.ts#L196) | Read JSON sync | `readJsonSync('config.json')` |
| [`readYaml()`](src/utils/fs.ts#L210) | Read YAML | `await readYaml('config.yaml')` |
| [`readCsv()`](src/utils/fs.ts#L303) | Read CSV | `await readCsv('data.csv')` |
| [`readLines()`](src/utils/fs.ts#L404) | Read line by line | `for await (const line of readLines(file))` |
| [`readStdin()`](src/utils/fs.ts#L437) | Read stdin | `await readStdin()` |

#### File Writing
| Function | Description | Example |
|----------|-------------|---------|
| [`writeFile()`](src/utils/fs.ts#L461) | Write file async | `await writeFile('file.txt', content)` |
| [`writeFileSync()`](src/utils/fs.ts#L475) | Write file sync | `writeFileSync('file.txt', content)` |
| [`writeJson()`](src/utils/fs.ts#L490) | Write JSON | `await writeJson('config.json', data)` |
| [`writeJsonSync()`](src/utils/fs.ts#L504) | Write JSON sync | `writeJsonSync('config.json', data)` |
| [`writeCsv()`](src/utils/fs.ts#L518) | Write CSV | `await writeCsv('data.csv', rows)` |
| [`appendFile()`](src/utils/fs.ts#L540) | Append file async | `await appendFile('log.txt', line)` |

#### File Operations
| Function | Description | Example |
|----------|-------------|---------|
| [`copyFile()`](src/utils/fs.ts#L555) | Copy file | `await copyFile('src', 'dest')` |
| [`moveFile()`](src/utils/fs.ts#L575) | Move file | `await moveFile('src', 'dest')` |
| [`deleteFile()`](src/utils/fs.ts#L595) | Delete file | `await deleteFile('file.txt')` |
| [`truncateFile()`](src/utils/fs.ts#L615) | Truncate file | `await truncateFile('file.txt', 100)` |

#### Directory Operations
| Function | Description | Example |
|----------|-------------|---------|
| [`createDir()`](src/utils/fs.ts#L640) | Create directory | `await createDir('mydir')` |
| [`createDirAll()`](src/utils/fs.ts#L655) | Create nested dir | `await createDirAll('a/b/c')` |
| [`readDir()`](src/utils/fs.ts#L670) | Read directory | `await readDir('mydir')` |
| [`readDirRecursive()`](src/utils/fs.ts#L685) | Recursive read | `await readDirRecursive('dir')` |
| [`walkDir()`](src/utils/fs.ts#L715) | Walk directory | `for await (const entry of walkDir('dir'))` |
| [`deleteDir()`](src/utils/fs.ts#L745) | Delete directory | `await deleteDir('mydir')` |
| [`deleteDirAll()`](src/utils/fs.ts#L765) | Delete recursive | `await deleteDirAll('dir')` |
| [`copyDir()`](src/utils/fs.ts#L785) | Copy directory | `await copyDir('src', 'dest')` |

#### Path Operations
| Function | Description | Example |
|----------|-------------|---------|
| [`exists()`](src/utils/fs.ts#L820) | Check exists | `await exists('file.txt')` |
| [`existsSync()`](src/utils/fs.ts#L835) | Check exists sync | `existsSync('file.txt')` |
| [`isFile()`](src/utils/fs.ts#L850) | Is file? | `isFile('path')` |
| [`isDirectory()`](src/utils/fs.ts#L865) | Is directory? | `isDirectory('path')` |
| [`isSymlink()`](src/utils/fs.ts#L880) | Is symlink? | `isSymlink('path')` |

#### File Information
| Function | Description | Example |
|----------|-------------|---------|
| [`getFileInfo()`](src/utils/fs.ts#L910) | Get file info | `await getFileInfo('file.txt')` |
| [`getFileSize()`](src/utils/fs.ts#L940) | Get size | `getFileSize('file.txt')` |
| [`getFileHash()`](src/utils/fs.ts#L955) | Get hash | `await getFileHash('file.txt')` |

---

### 8. Data Structures (`@saffan/devtools-js/structures`)

High-performance data structures for common programming patterns.

| Class | Description | Use Case |
|-------|-------------|----------|
| [`LRUCache`](src/utils/structures.ts#L12) | LRU Cache with TTL | Cache with size limits |
| [`RateLimiter`](src/utils/structures.ts#L223) | Token bucket rate limiter | API rate limiting |
| [`TokenBucket`](src/utils/structures.ts#L315) | Token bucket algorithm | Rate limiting |
| [`PriorityQueue`](src/utils/structures.ts#L381) | Priority queue | Scheduling, Dijkstra |
| [`Deque`](src/utils/structures.ts#L496) | Double-ended queue | Sliding windows |
| [`Stack`](src/utils/structures.ts#L580) | LIFO stack | Undo/redo |
| [`Queue`](src/utils/structures.ts#L640) | FIFO queue | Task processing |
| [`Heap`](src/utils/structures.ts#L700) | Binary heap | Heap sort, priority |
| [`MinHeap`](src/utils/structures.ts#L760) | Min-heap | Find min efficiently |
| [`MaxHeap`](src/utils/structures.ts#L800) | Max-heap | Find max efficiently |
| [`BloomFilter`](src/utils/structures.ts#L840) | Probabilistic filter | Set membership |
| [`Trie`](src/utils/structures.ts#L900) | Prefix tree | Autocomplete |
| [`Graph`](src/utils/structures.ts#L960) | Undirected graph | Relationships |
| [`DirectedGraph`](src/utils/structures.ts#L1020) | Directed graph | DAGs, workflows |
| [`DisjointSet`](src/utils/structures.ts#L1080) | Union-find | Connected components |
| [`BitSet`](src/utils/structures.ts#L1140) | Bit array | Flags, sets |

---

### 9. Stream Utilities (`@saffan/devtools-js/stream`)

Node.js stream manipulation, conversion, and transformation utilities.

#### Stream Conversion
| Function | Description | Example |
|----------|-------------|---------|
| [`streamToBuffer()`](src/utils/stream.ts#L235) | Stream to buffer | `await streamToBuffer(stream)` |
| [`bufferToStream()`](src/utils/stream.ts#L255) | Buffer to stream | `bufferToStream(buffer)` |
| [`streamToJson()`](src/utils/stream.ts#L267) | Stream to JSON | `await streamToJson(stream)` |
| [`streamToString()`](src/utils/stream.ts#L280) | Stream to string | `await streamToString(stream)` |
| [`stringToStream()`](src/utils/stream.ts#L294) | String to stream | `stringToStream('text')` |
| [`streamToLines()`](src/utils/stream.ts#L312) | Stream to lines | `await streamToLines(stream)` |
| [`streamToArray()`](src/utils/stream.ts#L333) | Stream to array | `await streamToArray(stream)` |

#### Stream Creation
| Function | Description | Example |
|----------|-------------|---------|
| [`createReadStream()`](src/utils/stream.ts#L354) | Create read stream | `createReadStream('file.txt')` |
| [`createWriteStream()`](src/utils/stream.ts#L367) | Create write stream | `createWriteStream('file.txt')` |
| [`createTransformStream()`](src/utils/stream.ts#L381) | Create transform | `createTransformStream(fn)` |
| [`createPassThroughStream()`](src/utils/stream.ts#L403) | Pass-through | `createPassThroughStream()` |

#### Stream Manipulation
| Function | Description | Example |
|----------|-------------|---------|
| [`concatenateStreams()`](src/utils/stream.ts#L444) | Concatenate | `concatenateStreams(s1, s2)` |
| [`mergeStreams()`](src/utils/stream.ts#L469) | Merge streams | `mergeStreams(s1, s2)` |
| [`zipStreams()`](src/utils/stream.ts#L497) | Zip streams | `zipStreams(s1, s2)` |
| [`filterStream()`](src/utils/stream.ts#L520) | Filter stream | `filterStream(stream, fn)` |
| [`mapStream()`](src/utils/stream.ts#L545) | Map stream | `mapStream(stream, fn)` |

#### Stream Progress
| Function | Description | Example |
|----------|-------------|---------|
| [`progressStream()`](src/utils/stream.ts#L600) | Progress tracking | `progressStream(stream, total)` |
| [`createProgressListener()`](src/utils/stream.ts#L630) | Progress listener | `createProgressListener()`` |

#### Buffering
| Function | Description | Example |
|----------|-------------|---------|
| [`bufferStream()`](src/utils/stream.ts#L660) | Buffer stream | `bufferStream(stream, size)` |
| [`batchStream()`](src/utils/stream.ts#L690) | Batch items | `batchStream(stream, batchSize)` |

#### Compression
| Function | Description | Example |
|----------|-------------|---------|
| [`createGzipStream()`](src/utils/stream.ts#L750) | Gzip compress | `createGzipStream()` |
| [`createGunzipStream()`](src/utils/stream.ts#L770) | Gzip decompress | `createGunzipStream()` |
| [`createBrotliCompressStream()`](src/utils/stream.ts#L790) | Brotli compress | `createBrotliCompressStream()` |

---

### 10. Crypto Utilities (`@saffan/devtools-js/crypto`)

Cryptographic operations including hashing, encryption, and secure random generation.

#### Hashing
| Function | Description | Example |
|----------|-------------|---------|
| [`hash()`](src/utils/crypto.ts#L150) | Hash data | `hash('data', 'sha256')` |
| [`hashFile()`](src/utils/crypto.ts#L164) | Hash file | `await hashFile('file.txt')` |
| [`hashSync()`](src/utils/crypto.ts#L178) | Hash sync | `hashSync('data')` |
| [`hmac()`](src/utils/crypto.ts#L191) | Create HMAC | `hmac('data', 'key')` |
| [`hashPassword()`](src/utils/crypto.ts#L207) | Hash password | `hashPassword('pass')` |
| [`verifyPassword()`](src/utils/crypto.ts#L232) | Verify password | `verifyPassword('pass', hash, salt)` |
| [`scrypt()`](src/utils/crypto.ts#L253) | Scrypt KDF | `scrypt('pass', salt, 64)` |

#### Encryption
| Function | Description | Example |
|----------|-------------|---------|
| [`encrypt()`](src/utils/crypto.ts#L313) | Encrypt with password | `encrypt('data', 'pass')` |
| [`decrypt()`](src/utils/crypto.ts#L338) | Decrypt with password | `decrypt(encrypted, 'pass', iv, salt)` |
| [`encryptWithKey()`](src/utils/crypto.ts#L363) | Encrypt with key | `encryptWithKey(data, key, iv)` |
| [`decryptWithKey()`](src/utils/crypto.ts#L388) | Decrypt with key | `decryptWithKey(data, key, iv)` |
| [`generateKey()`](src/utils/crypto.ts#L410) | Generate key | `generateKey('aes-256-cbc')` |
| [`generateIv()`](src/utils/crypto.ts#L440) | Generate IV | `generateIv('aes-256-cbc')` |
| [`deriveKey()`](src/utils/crypto.ts#L462) | Derive key | `deriveKey('pass', salt)` |

#### Asymmetric Encryption
| Function | Description | Example |
|----------|-------------|---------|
| [`rsaEncrypt()`](src/utils/crypto.ts#L550) | RSA encrypt | `rsaEncrypt(data, publicKey)` |
| [`rsaDecrypt()`](src/utils/crypto.ts#L570) | RSA decrypt | `rsaDecrypt(data, privateKey)` |
| [`rsaSign()`](src/utils/crypto.ts#L590) | RSA sign | `rsaSign(data, privateKey)` |
| [`rsaVerify()`](src/utils/crypto.ts#L610) | RSA verify | `rsaVerify(data, signature, publicKey)` |
| [`ecGenerateKeyPair()`](src/utils/crypto.ts#L650) | EC key pair | `ecGenerateKeyPair()` |

#### Encoding
| Function | Description | Example |
|----------|-------------|---------|
| [`toBase64()`](src/utils/crypto.ts#L750) | To Base64 | `toBase64(data)` |
| [`fromBase64()`](src/utils/crypto.ts#L765) | From Base64 | `fromBase64(str)` |
| [`toHex()`](src/utils/crypto.ts#L780) | To hex | `toHex(data)` |
| [`fromHex()`](src/utils/crypto.ts#L795) | From hex | `fromHex(str)` |
| [`toBase64Url()`](src/utils/crypto.ts#L810) | URL-safe Base64 | `toBase64Url(data)` |

#### Random Generation
| Function | Description | Example |
|----------|-------------|---------|
| [`randomBytes()`](src/utils/crypto.ts#L830) | Random bytes | `randomBytes(32)` |
| [`randomString()`](src/utils/crypto.ts#L845) | Random string | `randomString(16)` |
| [`randomInt()`](src/utils/crypto.ts#L860) | Random int | `randomInt(0, 100)` |
| [`randomUuid()`](src/utils/crypto.ts#L875) | UUID v4 | `randomUuid()` |

---

### 11. Async Utilities (`@saffan/devtools-js/async`)

Advanced async patterns including retry, concurrency control, and timeouts.

| Function | Description | Example |
|----------|-------------|---------|
| [`sleep()`](src/utils/async.ts#L7) | Pause execution | `await sleep(1000)` |
| [`retry()`](src/utils/async.ts#L33) | Retry with backoff | `await retry(fn, options)` |
| [`asyncQueue()`](src/utils/async.ts#L89) | Concurrency limit | `await asyncQueue(tasks, 3)` |
| [`safeTry()`](src/utils/async.ts#L121) | Error handling | `[error, result] = await safeTry(fn)` |
| [`measureTime()`](src/utils/async.ts#L136) | Measure duration | `{result, duration}` |
| [`retryWithBackoff()`](src/utils/async.ts#L158) | Retry with backoff | `await retryWithBackoff(fn)` |
| [`withTimeout()`](src/utils/async.ts#L190) | Add timeout | `await withTimeout(fn, 5000)` |
| [`debouncePromise()`](src/utils/async.ts#L223) | Debounced promise | `debouncedFn()` |
| [`throttlePromise()`](src/utils/async.ts#L259) | Throttled promise | `throttledFn()` |
| [`batchProcess()`](src/utils/async.ts#L300) | Batch processing | `await batchProcess(items, batchSize)` |

---

### 12. Object Utilities (`@saffan/devtools-js/objects`)

Object manipulation, deep cloning, and property access.

| Function | Description | Example |
|----------|-------------|---------|
| [`deepClone()`](src/utils/objects.ts#L7) | Deep clone | `deepClone(obj)` |
| [`pick()`](src/utils/objects.ts#L18) | Pick properties | `pick(obj, ['a','b'])` |
| [`omit()`](src/utils/objects.ts#L36) | Omit properties | `omit(obj, ['password'])` |
| [`merge()`](src/utils/objects.ts#L52) | Deep merge | `merge(obj1, obj2)` |
| [`isEmpty()`](src/utils/objects.ts#L84) | Check empty | `isEmpty(obj)` |
| [`deepEqual()`](src/utils/objects.ts#L100) | Deep equality | `deepEqual(a, b)` |
| [`memoize()`](src/utils/objects.ts#L139) | Memoize function | `memoizedFn()` |
| [`once()`](src/utils/objects.ts#L185) | Run once | `onetimeFn()` |
| [`limitCalls()`](src/utils/objects.ts#L209) | Limit calls | `limitedFn()` |
| [`get()`](src/utils/objects.ts#L249) | Get nested value | `get(obj, 'a.b.c')` |
| [`set()`](src/utils/objects.ts#L262) | Set nested value | `set(obj, 'a.b.c', value)` |
| [`has()`](src/utils/objects.ts#L286) | Has nested property | `has(obj, 'a.b.c')` |
| [`del()`](src/utils/objects.ts#L301) | Delete nested | `del(obj, 'a.b.c')` |

---

### 13. Core Utilities (Main Export)

These are the most commonly used utilities exported from the main package:

| Function | Description | Example |
|----------|-------------|---------|
| [`sleep()`](src/index.ts#L11) | Pause execution | `await sleep(1000)` |
| [`retry()`](src/index.ts#L37) | Retry with backoff | `await retry(fn, {times:3})` |
| [`uuid()`](src/index.ts#L89) | Generate UUID | `uuid()` |
| [`logger`](src/index.ts#L151) | Colored logger | `logger.info('msg')` |
| [`readJSON()`](src/index.ts#L157) | Read JSON file | `await readJSON('config.json')` |
| [`writeJSON()`](src/index.ts#L164) | Write JSON file | `await writeJSON('config.json', data)` |
| [`fileExists()`](src/index.ts#L171) | Check file exists | `await fileExists('file.txt')` |
| [`timer()`](src/index.ts#L253) | Measure time | `const end = timer('task'); end()` |
| [`safeTry()`](src/index.ts#L271) | Safe async try | `[err, data] = await safeTry(fn)` |
| [`asyncQueue()`](src/index.ts#L318) | Concurrency limit | `await asyncQueue(tasks, 3)` |
| [`debounce()`](src/index.ts#L188) | Debounce function | `debouncedFn()` |
| [`throttle()`](src/index.ts#L208) | Throttle function | `throttledFn()` |
| [`hash()`](src/index.ts#L306) | Create hash | `hash('data')` |
| [`randomString()`](src/index.ts#L237) | Random string | `randomString(16)` |
| [`deepClone()`](src/index.ts#L227) | Deep clone | `deepClone(obj)` |
| [`isEmpty()`](src/index.ts#L349) | Check empty | `isEmpty(val)` |
| [`merge()`](src/index.ts#L365) | Deep merge | `merge(obj1, obj2)` |
| [`env`](src/index.ts#L394) | Env helpers | `env.string('API_KEY')` |
| [`formatError()`](src/index.ts#L480) | Format error | `formatError(err)` |

---

## 🖥️ CLI Tool

Use utilities directly from the command line:

```bash
# Generate UUID
npx @saffan/devtools-js uuid

# Hash text
npx @saffan/devtools-js hash "hello world"

# Generate random string
npx @saffan/devtools-js random 16

# Format bytes
npx @saffan/devtools-js bytes 1048576

# Check file exists
npx @saffan/devtools-js exists package.json

# Sleep/pause
npx @saffan/devtools-js sleep 1000

# Show library info
npx @saffan/devtools-js info
```

---

## 📊 Feature Summary

| Category | Functions | Status |
|----------|-----------|--------|
| Array Utilities | 35+ | ✅ Complete |
| Math Utilities | 60+ | ✅ Complete
 | Date Utilities | 80+ | ✅ Complete |
| URL Utilities | 50+ | ✅ Complete |
| CLI Utilities | 50+ | ✅ Complete |
| System Utilities | 30+ | ✅ Complete |
| File System Utilities | 50+ | ✅ Complete |
| Data Structures | 15+ | ✅ Complete |
| Stream Utilities | 30+ | ✅ Complete |
| Crypto Utilities | 40+ | ✅ Complete |
| Async Utilities | 10+ | ✅ Complete |
| Object Utilities | 15+ | ✅ Complete |
| **Total** | **500+** | ✅ **Complete** |

---

## 🎯 Why @saffan/devtools-js?

1. **Comprehensive** - 500+ utilities covering all common development needs
2. **Zero dependencies** - Only uses Node.js built-ins
3. **TypeScript ready** - Full type definitions and JSDoc comments
4. **Production tested** - Used in real applications with proper error handling
5. **Well documented** - Comprehensive README with examples for every function
6. **CLI included** - Use utilities from command line
7. **Modular** - Import only what you need
8. **Maintainable** - Follows best practices and coding standards

---

## 🧪 Real-world Examples

### API Client with Retry

```javascript
import { retry, logger } from '@saffan/devtools-js';

async function fetchWithRetry(url) {
  return await retry(async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }, {
    times: 3,
    delay: 200,
    backoff: "exponential"
  });
}
```

### Configuration Management

```javascript
import { merge, env } from '@saffan/devtools-js';

const baseConfig = { port: 3000, debug: false };
const envConfig = {
  port: env.number('PORT', 3000),
  debug: env.bool('DEBUG', false)
};
const finalConfig = merge(baseConfig, envConfig);
```

### File Processing Pipeline

```javascript
import { asyncQueue, readJSON, writeJSON } from '@saffan/devtools-js';

async function processFiles(files) {
  const results = await asyncQueue(
    files.map(file => async () => {
      const data = await readJSON(file);
      return transform(data);
    }),
    5 // 5 concurrent workers
  );
  await writeJSON('output.json', results);
}
```

### Date Range Calculations

```javascript
import { 
  addDays, subDays, 
  startOfMonth, endOfMonth,
  isBetween, format 
} from '@saffan/devtools-js';

const today = new Date();
const monthStart = startOfMonth(today);
const monthEnd = endOfMonth(today);
const nextWeek = addDays(today, 7);

console.log(format(monthStart, 'YYYY-MM-DD'));
console.log(isBetween(today, monthStart, monthEnd));
```

### URL Manipulation

```javascript
import { 
  parse, addQueryParam, 
  withProtocol, buildUrl 
} from '@saffan/devtools-js';

const url = 'https://api.example.com/users';
const withParams = addQueryParam(url, 'page', 2);
const https = withProtocol(url, 'https');
const api = buildUrl('https', 'api.example.com', '/v1/users');
```

---

## 🔧 TypeScript Support

All utilities include full TypeScript type definitions:

```typescript
import { retry, asyncQueue, LRUCache } from '@saffan/devtools-js';

// Type-safe retry
await retry<User[]>(async () => {
  return fetchUsers();
}, { times: 3 });

// Generic data structures
const cache = new LRUCache<string, User>(100);
cache.set('user1', { name: 'John' });
const user = cache.get('user1');
```

---

## 🌐 Browser Support

The following utilities work in browser environments:

- **Array Utilities** - All functions
- **Math Utilities** - All functions
- **Date Utilities** - All functions (uses native Date)
- **URL Utilities** - All functions (uses native URL)
- **Crypto** - Uses Web Crypto API when available

The following require Node.js:

- **CLI Utilities** - Requires Node.js process/stderr
- **System Utilities** - Requires Node.js os/process
- **File System Utilities** - Requires Node.js fs module
- **Stream Utilities** - Requires Node.js streams

---

## ⚡ Performance

All utilities are optimized for performance:

- Zero runtime dependencies
- Minimal memory allocation
- Efficient algorithms (O(n) where possible)
- Tree-shakable ES modules
- No polyfills required

---

## 📁 Project Structure

```
devtools-js/
├── src/
│   ├── index.ts           # Main exports
│   └── utils/
│       ├── array.ts       # Array utilities
│       ├── math.ts        # Math utilities
│       ├── date.ts        # Date utilities
│       ├── url.ts         # URL utilities
│       ├── cli.ts         # CLI utilities
│       ├── system.ts      # System utilities
│       ├── fs.ts          # File system utilities
│       ├── structures.ts  # Data structures
│       ├── stream.ts      # Stream utilities
│       ├── crypto.ts      # Crypto utilities
│       ├── async.ts       # Async utilities
│       ├── objects.ts     # Object utilities
│       └── strings.ts     # String utilities
├── cli.js                 # CLI entry point
├── package.json           # Package config
└── README.md              # Documentation
```

---

## 🤝 Contributing

**Contributions welcome!** This is an open-source project and we appreciate your help!

```bash
# Clone the repository
git clone https://github.com/saff9/devtools-js.git
cd devtools-js

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

### Ways to Contribute:

- **🐛 Bug Reports** - Open issues for bugs you find
- **🚀 Feature Requests** - Suggest new utilities
- **📝 Documentation** - Improve docs and examples
- **💻 Code Contributions** - Add new features or fix bugs
- **🌟 Star the Repo** - Show your support
- **📢 Spread the Word** - Share on social media

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **GitHub Issues** - Report bugs and request features
- **GitHub Discussions** - Ask questions and share ideas
- **NPM** - Package info and downloads

---

## 🙏 Acknowledgments

Thanks to all contributors who have helped make this project better!

---

<div align="center">

**Made with ❤️ by [saff9](https://github.com/saff9)**

**⭐ Star us on GitHub if you find this useful!**

</div>
