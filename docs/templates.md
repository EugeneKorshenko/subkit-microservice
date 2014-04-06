Templates
----
```
<html>
<head>
    <title>@locals.title</title>
</head>
<body>

@locals.name<br>

<ul class="Task">
@for(var i = 0; i < 5; i ++){
    <li class="@(i % 2 ? "Odd" : "Even")">
      <a href="/task/i">i</a>
    </li>
}
</ul>

<p>
if you like it, let me know!<br />
- <a href="mike.bild@gmail.com">mike.bild@gmail.com</a><br />
</p>

</body>
</html>
```