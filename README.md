# suimjs
A simple ui module

`SGrid` shows a `view-column` icon in the toolbar beside the New button. Click it
to check or uncheck the fields displayed by the grid. All fields configured
with `readType: 'show'` are checked initially; fields hidden by configuration
are excluded. Choices apply to the entire grid and last for that mounted
instance, including data refreshes. They do not change the configuration or
record values. By default the icon is hidden when fewer than five fields are
configured with `readType: 'show'`. Checkbox/Action columns and the user's
visibility choices do not affect this count. On `SGrid` or `DataList`, set
`:hide-show-field-button="true"` (`hideShowFieldButton`) to always hide it,
or `:hide-show-field-button="false"` to always show it. Custom
`header_buttons` slots replace the default toolbar actions, including this icon.

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
