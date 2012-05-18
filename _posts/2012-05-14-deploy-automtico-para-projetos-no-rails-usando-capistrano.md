---
layout: post
title: "Deploy automático para projetos não Rails, usando Capistrano"
published: true
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

#### E agora ?

Após configurar este arquivo, iremos configurar os arquivos referente aos ambientes: 

{% highlight bash %}
 $ mkdir -p config/deploy/
 $ touch config/deploy/dev.rb config/deploy/staging.rb config/deploy/prod.rb
{% endhighlight %}

Abra o arquivo no seu editor preferido (vim): ``config/deploy/dev.rb`` e coloque o seguinte conteúdo:


{% highlight ruby linenos %}
role :app, "www.meuservidor.com"
role :web, "www.meuservidor.com"
role :db,  "www.meuservidor.com", :primary => true
{% endhighlight %}

Aqui neste arquivo você configurará o seu servidor com as roles :app, :web e :db. Só isso é o necessário neste arquivo. Os arquivos ``config/deploy/staging.rb`` e ``config/deploy/prod.rb`` recebem a mesma configuração, trocando o servidor, claro. Um exemplo de deploy pra produção em mais de um servidor:

{% highlight ruby linenos %}
role :app, "www.meuservidordeproducao1.com", "www.meuservidordeproducao2.com"
role :web, "www.meuservidordeproducao1.com"
role :db,  "www.meuservidordeproducao2.com", :primary => true
{% endhighlight %}

Nessa configuração você poderá colocar o ip do seu servidor no lugar do hostname se preferir. As roles são usadas para definir onde alguns comandos serão realizados, quais servidores vão receber o deploy, etc.

#### O que o capistrano faz que é específico do Rails ?

Bom antes de explicar isso, preciso explicar sobre a estrutura de diretórios que ele cria para fazer o deploy. A sua configuração ``:deploy_to`` é usada e para explicar vou assumir que você configurou como no exemplo acima: ``/var/www/super_django``. Com essa estrutura, o Capistrano precisará criar a seguinte árvore de diretórios:

{% highlight bash %}
 $ cd /var/www/super_django
 $ ls
 current
 shared
 releases
{% endhighlight %}

1. O diretório *releases* é onde o capistrano irá descomprimir o seu .tar.gz, usando o timestamp da maquina na hora do deploy como pasta do conteúdo, ou seja, ele irá criar antes de descomprimir o diretorio ``/var/www/super_django/releases/20120514143154`` (por exemplo), e irá descomprimir seu .tar.gz aí dentro.
2. O diretório *current* é um link simbólico pro último diretório criado no releases. Esse link é destruído a cada deploy e reconstruído apontando pra nova pasta do releases, ou seja, a pasta do deploy atual que você estará fazendo.
3. O diretório *shared* é um diretório utilizado para armazenar coisas que serão usadas por todas as versões deployadas, que você não pode perder, por exemplo: Upload dos usuários.

Dessa forma o Capistrano facilita uma coisa muito importante em deploys: A possibilidade de fazer rollback de forma simples. Um comando ``cap rollback`` fará com que ele conecte no servidor, remova o link simbolico atual e crie o link simbolico pra versão anterior que estiver no releases.

Uma das coisas específicas que o Capistrano faz para projetos rails é criar um link simbólico do public da pasta Rails pro shared. E a outra é o restart onde ele tenta rodar o arquivo current/script/process/reaper. Precisamos desabilitar isso, como? Assim:

Abra o arquivo ``Capfile`` na raiz do seu projeto e adicione ao **final do arquivo**:

{% highlight ruby %}

namespace :deploy do
    task :finalize_update do
        # essa task assume que eh um projeto rails e faz
        # symlink do public pro shared, e do logs
        # coisa que nao queremos
    end

    # :restart redefinido para nao chamar o reaper
    desc "Tira a configuracao especifica do rails de restart, podemos colocar a nossa aqui"
    task :restart, :roles => :app do
        # aqui voce pode configurar o seu restart
        # run /var/www/:application/restart/meu-script-de-restart.sh
    end
end

{% endhighlight %}

Este código sobrescreve duas tasks: :finalize_update e :restart. Elas são as tasks especificas do Rails e basta você modificá-las para a sua necessidade.

É também importante habilitar a task que limpa o releases se passar de um número configurado de pastas, para não encher seu filesystem com releases infinitos. Cada deploy gera uma pasta no releases como explicado anteriormente, então, para isso, coloque em qualquer lugar do seu ``Capfile``:

{% highlight ruby %}
set :keep_releases, 3
after "deploy:restart", "deploy:cleanup"
{% endhighlight %}

Com isso, você configura para 3 o número máximo de releases (pode ser qualquer número), e caso um 4o release seja criado, o mais antigo será apagado automaticamente. É bastante útil.
### Conclusão

Foi fácil criar um mecanismo automático de deploy para qualquer projeto que não seja Rails, seguindo essas dicas. Podemos inclusive alterar o comportamento com hooks, como usamos ali acima quando escrevemos o ``after deploy:restart, "deploy:cleanup"``. Usando isso você conseguirá fazer qualquer passo em qualquer uma das fases do deploy do Capistrano, como por exemplo gerar os estáticos do Django (1.3+) rodando ``./manage.py collectstatic``. 

Para executar o deploy, basta digitar: ``cap <<ambiente>> deploy`` onde <<ambiente>> é um dos seus stages configurados, que no nosso caso podem ser: ``cap dev deploy``, ``cap staging deploy`` e ``cap prod deploy``. O default stage é usado no ``cap deploy``, sem passar o ambiente.

No primeiro deploy, antes do comando acima precisa digitar ``cap <<ambiente>> deploy:setup`` para o Capistrano criar a estrutura básica de diretórios no seu servidor, como expliquei lá em cima :)

Para saber mais sobre o processo de deploy do Capistrano, as fases e como encaixar seu Hook, veja essa [imagem](https://github.com/mpasternacki/capistrano-documentation-support-files/raw/master/default-execution-path/Capistrano%20Execution%20Path.jpg "Processo de deploy do Capistrano")

Caso queira ver o template completo deste tutorial, subi ele aqui: [Template Capistrano para projetos não Rails](https://github.com/bmentges/capistrano-ext-template-non-rails-apps "Capistrano multistage template for non Rails apps")

Qualquer dúvida é só perguntar aí nos comentários. Abraços e bom Deploy :)
