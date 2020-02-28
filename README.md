# Reliure

Bind your LaTeX books for e-readers.

This tools is able to generate epub or mobi files.

## Installation

You need to have node installed on your computer:

Then you can install the BookBinding tools globally in order to be able to execute it wherever you want:

```sh
npm install -g bookbinding
```

## Usage

### Configuration file

Your entry point is a configuration file named `reliure.yml`:

```yaml
filename: "My Ebook"

default:
  coverImage: "cover.jpg"
  files:
    - "my-ebook.tex"

  metadata:
    language: "fr-FR"
    lang: "fr"

epub:
  metadata:
    identifier: "urn:isbn:1234567890123"
    rights: "ISBN: 123-4-5678901-2-3"

mobi:
  metadata:
    identifier: "urn:isbn:1234567890145"
    rights: "ISBN: 123-4-5678901-4-5"
```

### Commands

Usage: reliure [options]

Options:

- `--epub`: specify to bound the epub format
- `--mobi`: specify to bound the mobi format
- `-v`, `--version`: print the version number
- `-h`, `--help`: print usage information

Examples:

```sh
reliure --epub --mobi
reliure -v
reliure --version
```
