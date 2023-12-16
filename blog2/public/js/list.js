

window.addEventListener( "load", async function() {

    let listEl = document.getElementById( "list" );

    // index.xml を読み込んで、リンクの HTML に変換する
    let resp = await fetch( "index.xml" );
    let xml = await resp.text();
    let items = new DOMParser().parseFromString(xml, "text/xml");

    // 10, Feb 2022 的な表現を 2022 Feb 10 に変換する。
    let reTime = /.*,\s+(\d+)\s+([A-Za-z]+)\s+(\d+)\s+00:00:00.*/g;
    // URL の FQDN を相対に変更する。
    let reLink = /.*documents\//g;
    for ( const node of items.querySelectorAll("rss > channel > item") ) {
        let title = node.querySelector("title").firstChild.data;
        let link = node.querySelector("link").firstChild.data;
        link = link.replace( reLink, "./" );
        let pubDate = node.querySelector("pubDate").firstChild.data;
        pubDate = pubDate.replace( reTime, "$3 $2 $1" );

        let item = `
        <article class="list__item post">
	  <div class="list__meta meta">
            <div class="meta__item-datetime meta__item">
              <time class="meta__text">${pubDate}</time>
            </div>
          </div>
          
	  <h2 class="list__title post__title">
	    <a href="${link}">
              ${title}
	    </a>
	  </h2>
        </article>
`;

        let dom = new DOMParser().parseFromString( item, "text/html");
        listEl.appendChild( dom.querySelector( "article" ) );
    }
} );
