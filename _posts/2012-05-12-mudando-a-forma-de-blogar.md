---
layout: post
title: "Mudando a forma de blogar"
description: "O que me fez sair do wordpress?"
category: blogging
tags: ['blog']
---

De um tempo pra cá venho estudando uma forma mais simples de blogar. O
Wordpress foi meu software predileto de blogging, mas hoje em dia ele não serve
mais por alguns motivos simples:

* Ele é todo dinâmico, tomando um tempo precioso do usuário renderizando a
página toda vez que ela é acessada.
* Pra deixa-lo mais rápido pré-gerando as páginas o trabalho é grande entre
instalar plugins e configurar o servidor.
* Você só consegue criar um post quando está online e dentro do painel
administrativo dele.
* É altamente dependente de plugins
* A linguagem de desenvolvimento pra ele é PHP, que pra mim é um ponto
negativo.
* Personalizar ele dá um trabalho grande

Atualmente trabalho diariamente com um sistema de versionamento chamado
[GIT](http://http://git-scm.com/ "GIT"), e os meus requisitos para minha
nova forma de blogar são:

1. Poder ter versionamento dos meus posts através do GIT.
2. Poder fazer push e publicar automaticamente.
3. Aceitar Markdown como sintaxe pra geração dos posts e a lib Pygments pra
   colorir as partes que tem código.
4. Ter uma forma simples de incluir snippets de código (botão like, twitter,
   disqus, analytics, etc) em todo o site sem precisar colocar manualmente em cada página.
5. Ser fácil de extender e usar, de preferência em uma linguagem que conheço.
6. Ser possível migrar meus posts antigos do wordpress.

Com esses requisitos alguns candidatos apareceram:
[nanoc-blog](https://github.com/flyingmachine/nanoc-blog "nanoc-blog") e
[jekyll](https://github.com/mojombo/jekyll "jekyll"). Ambos são engines de
geração de arquivos estáticos para blogs.

Long story short, escolhi o Jekyll por esses motivos, além dele satisfazer
todos os meus pré-requisitos:

1. Foi fácil fazer meu blog
2. Alterar templates é fácil (vou melhorá-lo constantemente)
3. O github suporta ele como engine por trás do github pages e meu blog poderá
   ficar hospedado lá, o que é ótimo, **REDUZINDO CUSTOS**. Não precisarei mais
   pagar um vps só pra hospedar meu blog.
4. Se um dia quiser migrar pra outro vai ser muito simples!

Sendo assim, estarei migrando meus antigos posts pra cá, os mais importantes
que ainda façam sentido, afinal tenho posts anteriores a 2006, e continuando
meus artigos, devaneios e análises por aqui!

python:
{% highlight python linenos %}
def hello_world():
    print "Hello Jekyll"
{% endhighlight %}    

ruby:
{% highlight ruby linenos %}
def hello_world
    puts "Hello Jekyll"
end
{% endhighlight %}

javascript:
{% highlight javascript linenos %}
var hello_world = function() {
    console.log("Hello Jekyll");
}
{% endhighlight %}

java:
{% highlight java linenos %}
public void hello_world() {
    System.out.println("Hello Jekyll");
}
{% endhighlight %}


