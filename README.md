# suimjs
A simple ui module

`SDropDown` API lookups load 100 options initially, then append the next page
when the dropdown is scrolled to the bottom. The endpoint receives `Take` and
`Skip` and should return an array, including an empty array when no rows remain.
Search or lookup configuration changes restart pagination. Failed pages keep
the existing options and display a Retry button.

`maxResultCount` sets the page size (default: 100). A `lookupPayloadBuilder`
can supply its own `Take`, initial `Skip`, filters, and sorting; those settings
are retained across pages. Explicit `Take: 0` performs a single request.
API sorting includes `lookupKey` as a tie breaker for stable pagination.
Local `items` and custom `searchFn` retain their existing behavior.
