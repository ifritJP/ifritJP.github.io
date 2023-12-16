window.addEventListener( "load", async function() {
    let element = document.getElementsByClassName( "sidebar" )[0];
    let logImg = document.getElementsByClassName( "logo__img")[0];

    if ( element && logImg ) {
        let img = new Image();

        let re = /\/[^/]*$/;
        let link = logImg.src.replace( re, "" ) + "/wc.png";
        img.src = link;

        element.appendChild( img );
    }
});
