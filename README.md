# TW5-Mathdown - Math + Markdown in TiddlyWiki5

I have modified the official Markdown plugin of [TiddlyWiki5](http://tiddlywiki.com) to use [markdown-it](https://github.com/markdown-it/markdown-it) as Markdown parser, use [MathML](http://en.wikipedia.org/wiki/MathML) for (La)TeX equations (using [TeXZilla](https://github.com/fred-wang/TeXZilla) converter). This is an *unofficial* plugin, although I think it follows the general policy of TiddlyWiki.

As this plugin is in an **EXPERIMENTAL** stage, it may have some (lots of) bugs. If you are brave enough to give it a try, don't hesitate reporting bugs and raising issues on the project page on [GitHub](https://github.com/padawanphysicist/TW5-Mathdown) or [GitLab](https://gitlab.com/padawanphysicist/tw5-mathdown).

## Why another Markdown plugin?

The official TiddlyWiki5 Markdown plugin uses [markdown-js](https://github.com/evilstreak/markdown-js), which gets the tiddler text and outputs what it seem to be a JsonML tree, which is then used by TiddlyWiki.

However, for my purposes I had the following issues with markdown-js:

- Currently it does not support inline html ([issue](https://github.com/evilstreak/markdown-js/issues/219))
- Lack of support for [CommonMark](http://commonmark.org/) dialect ([issue](https://github.com/evilstreak/markdown-js/issues/210)).

The first issue is particularly important for me, as I would like to include [MathML](http://en.wikipedia.org/wiki/MathML) code together with Markdown.

This plugin breaks the parsing process into steps,

text → Escape tags → Math parsing → Markdown parsing → Preview,

and Markdown parsing is done by the following steps:

1. Parse markdown code into an HTML string,
2. Turn HTML string into a Json-like array,
3. Pass resulting array to TiddlyWiki to be rendered.

With this parsing process it is possible to use any parser which outputs an HTML string.

In particular, [markdown-it](https://github.com/markdown-it/markdown-it) parser solved my issues with markdown-js, it has additional extensions to Markdown, and it seems to have a more configurable syntax extension, as you can add new rules and replace existing ones.

### MathML Support
Not all browsers have support for MathML. As far as I know, [Firefox](https://www.mozilla.org/en-US/firefox/new/) has the most complete native support.

In those cases, it is still possible using this plugin by installing [MathJax plugin for TiddlyWiki5](http://mathjax-tw5.kantorsite.net/), so that MathML rendering will be done by MathJax, and not the browser. I tested this approach on Firefox, Chrome and Opera, and it worked quite well.

## Presets

As described by the authors of remarkable parser,

> Remarkable offers some "presets" as a convenience to quickly enable/disable active syntax rules and options for common use cases."

The presets can be activated by a configuration tiddler; current options are

| Preset     | Description                   |
| ---------- | ----------------------------- |
| Full       | Enable all available rules    |
| CommonMark | Enable strict CommonMark mode |


## Creating WikiLinks

In order to create wiki links, you can use the usual Markdown link syntax targeting `#` and the target tiddler title:

```
[link text](#TiddlerTitle)
```

## Creating Math
The math delimiters implemented so far are `$...$` for inline equations, and `\begin{equation}...\end{equation}` and `\[...\]` for displayed equations.
