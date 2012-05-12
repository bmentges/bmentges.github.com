---
layout: page
title: Bruno Mentges de Carvalho
tagline: Engenharia, gestão e meu cotidiano
---
{% include JB/setup %}


<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date:"%d-%m-%Y" }}</span> &raquo; <a href="
    {{BASE_PATH }}{{ post.url }}">{{ post.title }}</a>{% if post.description != "" %}: {{post.description}} {% endif %}</li>
  {% endfor %}
</ul>


