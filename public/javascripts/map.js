!function ($) {
  // Questa funzione è il workaround per IE9
  function cloneToDoc(node,doc){
   if (!doc) doc=document;
   var clone = doc.createElementNS(node.namespaceURI,node.nodeName);
   for (var i=0,len=node.attributes.length;i<len;++i){
    var a = node.attributes[i];
    // IE won't set xmlns or xmlns:foo attributes
    if (/^xmlns\b/.test(a.nodeName)) continue;
    clone.setAttributeNS(a.namespaceURI,a.nodeName,a.nodeValue);
   }
   for (var i=0,len=node.childNodes.length;i<len;++i){
    var c = node.childNodes[i];
    clone.insertBefore(
     c.nodeType==1 ? cloneToDoc(c,doc) : doc.createTextNode(c.nodeValue),
     null
    )
   }
   return clone;
  }

  // Carico l'svg esterno chiamando direttamente il metodo d3.xhr
  // Uso il MIME-TYPE generico "text/xml" per Opera
  d3.xhr("/images/italia_regioni.csv.svg", "text/xml", function(xml) {
   var svg = xml.responseXML.documentElement;
   try {
    // Provo ad attaccare l'svg al DOM (non funzionerà con IE9)
    document.getElementById("map_svg_container").appendChild(svg);
   } catch(e) { // Workaround per IE9
    console.log("IE");
    svg = cloneToDoc(svg);
    window.svgRoot = svg; // For reference by scripts
    delete window.svgRoot;
    document.getElementById("map_svg_container").appendChild(svg);
   }
   callback_function();
  });
}