---
layout: page
title: Hello World!
tagline: Supporting tagline
---
{% include JB/setup %}


<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date:"%d-%m-%Y" }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a>: 
    {{post.description}}</li>
  {% endfor %}
</ul>


