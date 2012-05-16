---
layout: post
title: "Deploy automático para projetos não Rails, usando Capistrano"
published: false
description: ""
category: devops
tags: [capistrano, deploy, devops]
---
{% include JB/setup %}

[Capistrano](https://github.com/capistrano/capistrano/wiki/ "Capistrano") é uma ferramenta de [deploy](http://pt.wikipedia.org/wiki/Implanta%C3%A7%C3%A3o_de_software "Implantação de Software") automático, usada para facilitar a vida do programador na hora de enviar o software para o ambiente de produção, ou qualquer outro ambiente externo (ex: ambiente de desenvolvimento, homologação, etc).

Feito em ruby, o Capistrano segue a filosofia do rails de ser um _opinionated software_, ou seja, um software feito em cima de opiniões fortes. Uma delas é a de que ele assume que você vai usar a estrutura de diretórios que ele sugere, que explicarei mais abaixo. Suas primeiras versões foram feitas para fazer o deploy automático de sistemas que usam o framework web [Rails](http://rubyonrails.org/ "Rails Framework") e por isso assumia algumas coisas que atrapalham quando você quer usa-lo para fazer deploy de sistemas que não são feitos em Rails. No nosso caso, explicarei como fazer o deploy de uma aplicação construída em Django, usando o Capistrano.

### Multistage

Multistage é o cenário da maioria das empresas atualmente, que significa ter vários estágios entre o desenvolvimento e o sistema em produção (acessado pelo usuário final). No meu caso, na globo.com, usamos os seguintes estágios: Ambiente Local (minha máquina) -> Ambiente de Desenvolvimento (DEV) -> Ambiente de Homologação (QA1) -> Ambiente de Staging (Staging) -> Produção (PROD).

Cada passagem de estágio, denotada pela setinha __->__ é feita de forma automática e costumamos usar a expressão: one click deploy (implantação com um clique). Essa é a nossa filosofia. Precisamos conseguir passar o código para os ambientes, até chegar no usuário final tendo apenas que apertar um botão. Existem algumas ferramentas diferentes sendo usadas para essa finalidade aqui na globo.com mas a mais comum nos projetos é o Capistrano.

O Capistrano por si só não suportava multistages de forma simples, por isso foi criado um plugin pro capistrano chamado [Capistrano-Ext](https://github.com/capistrano/capistrano/wiki/2.x-Multistage-Extension "Capistrano Extensions") (Capistrano Extensions), que acabou sendo incorporado no Capistrano, ainda que continue com o _namespace_ ``capistrano/ext/multistage``.

### Instalando o Capistrano

Os pré-requisitos para instalar o capistrano na sua máquina são: Ter [ruby](http://www.ruby-lang.org/en/ "Ruby Language") instalado, e ter rubygems instalado. Isto é o essencial para que você consiga instalar e usar o Capistrano, que é uma [gem](http://rubygems.org/ "RubyGems"). Você não precisa instalar nada disso nos servidores, o único pré-requisito nos servidores é ter acesso SSH.

Dado que você já tenha instalado o ruby o rubygems, digite no terminal:

{% highlight bash %}

$ gem install capistrano

{% endhighlight %}

Só isso. Mesmo. Para verificar que instalou tudo corretamente, digite no terminal:

{% highlight bash %}

$ cap -V
Capistrano v2.9.0

{% endhighlight %}

### Habilitando o Capistrano na sua aplicação

Digamos que sua aplicação Django esteja em ``~/projetos/super_django/``. Para habilitar o Capistrano nessa aplicação, basta seguir os passos abaixo no terminal:

{% highlight bash %}
$ cd ~/projetos/super_django/
$ capify .
[add] writing './Capfile'
[add] making directory './config'
[add] writing './config/deploy.rb'
[done] capified!
{% endhighlight %}

Com isso, o mínimo necessário para fazer o deploy de uma aplicação Rails estará instalado. É lógico que sabemos que nossa aplicação não é rails, é django (mas poderia ser PHP, C, Qualquer coisa).

O próximo passo é configurar o capistrano para carregar as extensões do capistrano-ext. Para isso edite o arquivo ``config/deploy.rb`` e troque para este conteudo \[não copie o número da linha ;)\]:

{% highlight ruby linenos %}
set :stages, %w(dev staging prod)
set :default_stage, "dev"
require 'capistrano/ext/multistage'

set :application, "super_django"
set :user, "www-data"
set :group, "www-data"

set :scm, :none
set :repository, "."

set :deploy_to, "/var/www/#{application}"
set :deploy_via, :copy
set :deploy_env, 'dev'

set :copy_dir, "/tmp"
set :copy_remote_dir, "/tmp"
set :copy_exclude, [ ".git", "**/*.log" ]
{% endhighlight %}

Este arquivo é um arquivo default do config.rb para a maioria dos nossos deploys. Vou explicar passo a passo o que cada variável ali significa, e o que precisamos saber agora é que essa configuração assume que você tem 3 ambientes: dev, staging e prod.

#### Explicação linha a linha

1. ``set :stages, %w(dev staging prod)``: Essa linha significa que você está configurando 3 ambientes para fazer deploy e os está chamando de dev, staging e prod. Você pode mudar essas strings para qualquer outra coisa. Pro capistrano, essa linha é um indicativo de onde ele vai incluir o arquivo específico do ambiente, exemplo. No caso de dev, deste exemplo, ele ira procurar o arquivo em ``config/deploy/dev.rb``, staging ele procurará em ``config/deploy/staging.rb`` e prod em ``config/deploy/prod.rb``. Se houvesse um ambiente configurado com o nome qualquercoisa ele procuraria ``config/deploy/qualquercoisa.rb``. Mais abaixo mostrarei o que vai nesses arquivos e porque eles existem.
2. ``set :default_stage, "dev"``: Essa linha configura qual ambiente ele vai usar caso você digite no terminal ``$ cap deploy``. No caso, os multistages são acessados na linha de comando para deploy assim: ``$ cap dev deploy`` para dev, ``$ cap staging deploy`` para staging e ``$ cap prod deploy`` para prod. O nome que configurar no seu set :stages será acessível entre cap e deploy, exemplo, se houver qualquercoisa lá, ``$ cap qualquercoisa deploy`` faria deploy pro ambiente _qualquercoisa_. Espero ter ficado claro!
3. ``require 'capistrano/ext/multistage'``: Essa linha inclui todas as extensões do Capistrano para lidar com multistages. Após set :stages e set :default_stage é o lugar correto para o require.
4. Linha em branco, para legibilidade :)
5. ``set :application, "super_django"``: Essa linha configura o nome da aplicação para ser usada como input em outras configurações.
6. ``set :user, "www-data"``: Configura o usuário que irá transferir os arquivos pro servidor.
7. ``set :group, "www-data"``: Configura o grupo do usuário que irá transferir os arquivos pro servidor.
8. Linha em branco, para legibilidade :)
9. ``set :scm, :none``: Esta é uma característica comum na maioria dos servidores: Não ter git instalado e não ter acesso externo a web. Quando você configura o scm pra none, você está dizendo pro Capistrano para ele gerar um .tar.gz de um diretório e é isso que vai subir pro servidor via SCP.
10. ``set :repository, "."``: Aqui você configura o diretorio raiz que gerará o arquivo com a extensão .tar.gz. que irá ser enviado para o servidor. No final do arquivo tem uma instrução de como ignorar arquivos para não copiar tudo.
11. Linha em branco, para legibilidade :)
12. ``set :deploy_to, "/var/www/#{application}"``: Aqui é a configuração de onde o arquivo será descompactado no servidor.
13. ``set :deploy_via, :copy``: Essa configuração indica que iremos copiar um arquivo pro servidor.
14. ``set :deploy_env, 'dev'``: Essa é uma configuração default... não afeta nada.
15. Linha em branco, para legibilidade :)
16. ``set :copy_dir, "/tmp"``: Esta configuração define onde no seu sistema será gerado o arquivo tar.gz para ser enviado ao servidor. Eu geralmente coloco no /tmp.
17. ``set :copy_remote_dir, "/tmp"``: Esta configuração define onde no servidor o arquivo será colocado, para depois ser descomprimido no diretório da configuração deploy_to.
18. ``set :copy_exclude, [ ".git", "**/*.log" ]``: Aqui você define quais arquivos não serão incluídos no .tar.gz. Útil para tirar arquivos fonte desnecessários, arquivos de testes, do controle de versão, etc. (muito útil)


