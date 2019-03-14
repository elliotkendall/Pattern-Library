---

state: review

---

## Getting Started

Tiles can be used to callout some relevant information and visually group similar content. Listing tiles are especially useful for inserting some listing information within the context of another page.

###### EXPORT VIA GRUNT

```
grunt export:molecules-tile-listing
```


### Description

The tile listing molecule can be used to include a listing tile within another pattern. Listing tiles are typically used to display some listing information sourced from one of our various feeds, such as news, events, exhibitions, and/or blogs.


### Best Practices

- Only link to one listing item per card


## Schema

| Name            | Type      | Description                                                                       | Value(s)                                | Default   |
|-----------------|-----------|-----------------------------------------------------------------------------------|-----------------------------------------|-----------|
| title           | `String`  | The title of the listing content to be displayed.                                 |                                         |           |
| badge           | `String`  | An optional badge to be displayed.                                                |                                         |           |
| description     | `String`  | An optional description to be displayed, limited to a maximum of `150` characters.|                                         |           |
| date            | `String`  | A formatted date or datetime string to be displayed.                              |                                         |           |
| image           | `String`  | A path or URL to an image, or some image data.                                    |                                         |           |
| label           | `String`  | An optional link label to be displayed as a call-to-action.                       |                                         |           |
| href            | `String`  | A path or URL that the listing content should link to.                            |                                         |           |
| target          | `String`  | Optionally indicates where the `href` hyperlink should be opened.                 | `_self`, `_blank`, `_parent`, or `_top` | `_self`   |
| align           | `Object`  | Optionally configures how the image should be aligned.                            |                                         |           |
| align.x         | `String`  | Configures the image's horizontal (`x`-axis) alignment.                           | `left`, `right`, or `center`            | `center`  |
| align.y         | `String`  | Configures the image's vertical (`y`-axis) alignment.                             | `top`, `bottom`, or `center`            | `center`  |


## Classes

### Variations

| Class               | Description                                                                                             |
|---------------------|---------------------------------------------------------------------------------------------------------|
| `-align-x-left`     | Left-aligns the listing image within its container.                                                     |
| `-align-x-right`    | Right-aligns the listing image within its container.                                                    |
| `-align-x-center`   | Horizontally centers the listing image within its container.                                            |
| `-align-y-top`      | Top-aligns the listing image within its container.                                                      |
| `-align-y-bottom`   | Bottom-aligns the listing image within its container.                                                   |
| `-align-y-center`   | Vertically centers the listing image within its container.                                              |

### State

| Class             |                                                                 |
|-------------------|-----------------------------------------------------------------|
| `has-description` | Indicates that the listing includes a description.              |
| `has-badge`       | Indicates that the listing includes a badge.                    |
| `has-action`      | Indicates that the listing includes a call-to-action link.      |