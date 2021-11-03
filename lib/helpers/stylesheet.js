module.exports = `body {
  margin: 5%;
  text-align: justify;
  font-size: medium;
}

code {
  font-family: monospace;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  text-align: left;
}

.titlepage h1,
.titlepage p,
.titlepage div {
  text-align: center;
}

nav#toc ol,
nav#landmarks ol {
  padding: 0;
  margin-left: 1em;
}

nav#toc ol li,
nav#landmarks ol li {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

a.footnote-ref {
  vertical-align: super;
}

em,
em em em,
em em em em em {
  font-style: italic;
}

em em,
em em em em {
  font-style: normal;
}

code {
  white-space: pre-wrap;
}

span.smallcaps {
  font-variant: small-caps;
}

span.underline {
  text-decoration: underline;
}

q {
  quotes: "“" "”" "‘" "’";
}

div.column {
  display: inline-block;
  vertical-align: top;
  width: 50%;
}

div.hanging-indent {
  margin-left: 1.5em;
  text-indent: -1.5em;
}

section:not(.titlepage) p {
  margin: 0;
  text-indent: 1.5em;
}`
