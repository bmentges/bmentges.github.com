---
layout: post
title: "Como usar corretamente as manpages no Linux/MacosX - man"
published: true
description: ""
category: devops
tags: [man, manpages, devops]
---

Existe um comando no Unix que é de extrema utilidade e que pouquíssima gente
sabe utilizar corretamente: o comando *man*.

Basicamente, são os manuais (UNIX Programmers Manual) de todos os programas do linux, como ls, grep,
awk, sed, etc.

O próprio comando man tem manual pages:

{% highlight bash %}
$ man man
{% endhighlight %}

O que mais confunde as pessoas, é a seção do manual ao qual um comando
pertence. Exemplo:

{% highlight bash %}
$ man sed

SED(1)                    BSD General Commands Manual    SED(1)

NAME
     sed -- stream editor

SYNOPSIS
     sed [-Ealn] command [file ...]
     sed [-Ealn] [-e command] [-f command_file] [-i extension] \
     [file ...]

DESCRIPTION
    (cortei para abreviar)

...

SEE ALSO
     awk(1), ed(1), grep(1), regex(3), compat(5), re_format(7)
...
{% endhighlight %}

O que é SED(1), o que é esse (1) ? O que é regex(3) ? Porque (3) ?

Esses são os tipos de perguntas que surgem ao usar o man. Esse números entre
parênteses são as categorias que o comando pertence. É uma forma de organizar,
porque alguns comandos pertencem a mais de uma categoria, e existem páginas de
manual diferentes pra cada uma.

Se eu quiser ver o manpage do regex(3), basta digitar:

{% highlight bash %}
$ man 3 regex
{% endhighlight %}

As categorias são:

1. Commands
2. System Calls
3. Library Functions
4. Special Files, Device Info
5. File Formats and Conventions
6. Games
7. Macro Packages and Language Conventions
8. Maintenance Commands and Procedures

Existe também uma hierarquia separada para cada tipo de software, mas não
precisamos gravar essas categorias, apenas saber que elas existem e é isso que
os números representam.

Ao usar o man, geralmente o manual tem mais de uma página e navegar nele é um
desafio, principalmente para quem não é acostumado com o vim (vi) ;)

Quando entrar no manual, você irá parar ao final da primeira página com um
símbolo de dois pontos ":" esperando algum comando. Esse prompt aceita todos os
comandos do vi para se mover no arquivo: j para descer, k para subir, aceita
numeros, por exemplo: 10j para descer 10 linhas, 10k para subir 10 linhas, onde
10 pode ser qualquer número e ele irá subir ou descer esses N números.

G para ir para o final do arquivo, g para o começo. e / para buscar. Segue um
pequeno cheatsheet:

{% highlight vim %}
j             descer
k             subir
10j           descer 10 linhas
10k           subir 10 linhas
g             começo do arquivo
G             final do arquivo
q             sair
ctrl+c        sair
/x            iniciar uma busca por x, ex:
/SEE ALSO     buscar por SEE ALSO
{% endhighlight %}

Espero que isso ajude mais pessoas a utilizar esse recurso que é muito bom para
aprender corretamente os comandos. Vou dar um exemplo de como saber usar o man
me ajudou:

Estava eu procurando uma definição de método nos arquivos python do meu
projeto pela linha de comando. Digitei:

{% highlight bash %}
$grep -ri "to_json" . 

./models.py:    def to_json(self):
Binary file ./models.pyc matches
./views.py:        json = lote.to_json()
Binary file ./views.pyc matches
{% endhighlight %}

Usei as flags -ri que significam, -r é buscar recursivamente a partir do diretório
que defini, no caso "." que é a partir do diretório atual, e -i significa
ignorar case, achar qualquer combinação independente de ser minúscula ou
maiúscula. 

Achei alguns arquivos python, mas ele também procurou nos arquivos binários
.pyc que o python gera depois de rodar e isso polui meus resultados. Eu não
quero buscar dentro de arquivos binários.

Ao olhar no manual page do grep, me deparei com uma flag que eu não conhecia:

{% highlight bash %}
$ man grep

GREP(1)

(encurtei para facilitar a leitura)
...
OPTIONS
...
-I     Process a binary file as if it did not contain matching data; 
       this is equivalent to the --binary-files=without-match option.
...
{% endhighlight %}

Pronto, achei uma flag que vai me ajudar!

Agora quando atualizei meu comando, os resultados melhoraram:

{% highlight bash %}
$grep -riI "to_json" . 

./models.py:    def to_json(self):
./views.py:        json = lote.to_json()
{% endhighlight %}

Saber usar os manpages te farão muito mais produtivo!
