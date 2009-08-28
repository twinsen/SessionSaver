 function include(file)
 {
   if (document.createElement && document.getElementsByTagName) {
     var head = document.getElementsByTagName('head')[0];

     var script = document.createElement('script');
     script.setAttribute('type', 'text/javascript');
     script.setAttribute('src', file);

     head.appendChild(script);
   } else {
     alert('Your browser can\'t deal with the DOM standard. That means it\'s old. Go fix it!');
   }
 }
