import { loadGraph } from './src/data-loader';
import { encodeGraph } from './src/tangle-pathway';




loadGraph().then(graph => {
    console.log("Graph loaded");
    var topNode = graph.getNode("IPESANZVQJHSXITAAUKFZXYZWVUDFTOSFOLPRDVUCLEMWGODUZYWKAWCDRTYVDYPYMEXAAOBAVQOA9999");
    if(topNode){
      
        console.log("Encoded", encodeGraph(graph, topNode));
    }
   
})