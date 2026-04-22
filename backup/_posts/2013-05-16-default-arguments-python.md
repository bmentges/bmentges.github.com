---
layout: post
title: "Python e default arguments nos metodos - gotchas"
published: true
description: ""
category: python
tags: [python]
---

Um dos recursos muito interessantes do python é a possibilidade de ter default
arguments (argumentos padrão) nos métodos. Exemplo:

{% highlight python lineno %}
Python 2.7.1 (r271:86832, Jul 31 2011, 19:30:53) 

>>> def save(x=[]):
...   print x
...
>>>
>>> save()
[]
>>> save([1])
[1]
{% endhighlight %}

Acima defini que o método save() recebe um argumento x, que seu default é \[\].
Caso nada seja passado pro método, \[\] é impresso. Quando chamei com \[1\],
ele imprimiu corretamente meu novo vetor.

Mas cuidado com o uso desse recurso. Uma característica pra ficar de olho é que
internamente o python cria um objeto mutavel ao ler a definição do método, o
que causa uns efeitos colaterais como esse:

{% highlight python lineno %}
Python 2.7.1 (r271:86832, Jul 31 2011, 19:30:53) 

>>> def save(x=[]):
...   x.append(1)
...   print x
...
>>>
>>> save()
[1]
>>> save()
[1, 1]
>>> save()
[1, 1, 1]
{% endhighlight %}

Sei que isso pode parecer básico para muitos, mas confunde bastante. O que leva
a confundir é a idéia de que "ao chamar o método ele SEMPRE associa \[\] na
variável x". Não é verdade, os argumentos default são avaliados e salvos quando
a declaração <strong>def</strong> é executada.

