function lctags_funcCallGraph_tree( nsId, name ) {

    var nodeMap = new Map();
    
    d3.json("call-graph-tree-data.js",
	    function(error, data) {
                if (error) throw error;                
                d3.hierarchy( data ).each(
                    function( d ) {
                        var info = nodeMap.get( d.data.nsId );
                        if ( !info || !info.children ) {
                            nodeMap.set( d.data.nsId, d.data );
                        }
                    });
                
	    });


    

    var paramInfo = {
        svgClick: function() {
            ;
        },
        nodeClick: function( obj, node ) {
            var nsId = node.nsId;
            var nodeId = node.id;

            var info = nodeMap.get( nsId );

            if ( ! info.type ) {
                info.type = "FunctionDecl";
            }
            if ( ! info.children ) {
                info.children = [];
            }

            var list = [];

            info.children.forEach(
                function( d ) {
                    list.push( d );                
                });
            
            obj.setNodeType( nodeId, info.type );
            obj.addChild( nodeId, list );
        },
        pathClick: function( obj, path ) {
            d3.event.stopPropagation();
            alert( "This function displays clicked " + obj.expandMode + " position at your emacs.\n" +
                   "But this function does not operate with this sample." );
        },
        nodeContext: function( obj, node ) {
            d3.event.stopPropagation();
            alert( "This function displays clicked function position at your emacs.\n" +
                   "But this function does not operate with this sample." );
        }
    };
        
    
    var obj = lctags_graph_tree( paramInfo );

    obj.addChild( null, [ { nsId: nsId, name: name, pos: [ 0, 0 ] } ] );
}
