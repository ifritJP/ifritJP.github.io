var endPoint = "/access";


var reqNum = 0;

function access( method, path, input, callback ) {
    reqNum++;
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (oReq.readyState == 4) {

            var lastReqObj = document.getElementById( "last-req" );
            lastReqObj.textContent = reqNum + ":" + (new Date()).toISOString() + ":" + oReq.status;
            
            if (oReq.status == 200) {
                if ( callback ) { 
                    callback( oReq.responseText );
                }
            } else {
            }
        }
    };

    {
        var endPointObj = document.getElementById( "end-point" );
        endPoint = endPointObj.value;
    }
    
    oReq.open( method, endPoint + path );
    var accountID = document.getElementById( "accountID" );
    oReq.setRequestHeader( "Authorization", "bearer " + accountID.value );
    oReq.send( input );
}
function accessToGet( path, callback ) {
    access( "GET", path, null, callback );
}



//============ target 

function deleteTarget( url ) {
    if ( !window.confirm( "削除しますか？ -- " + url ) ) {
        return;
    }
    access( "DELETE", "/rectargets", JSON.stringify( {"Url":url} ),
            responseText => {
                updateTargetList();
            });
}

function updateTargetList() {
    accessToGet( "/rectargets", responseText => {
        var targetList = JSON.parse(responseText).sort( ( val1, val2 ) => {
            return val1.Url > val2.Url;
        });
        accessToGet( "/schedules", responseText2 => {
            var targetObj = document.getElementById( "targetList" );
            targetObj.innerHTML = "";

            var list = JSON.parse(responseText2).sort( ( val1, val2 ) => {
                return val1.Url > val2.Url;
            });

            
            targetList.forEach( target => {
                var fieldSet = document.createElement('fieldset');
                targetObj.appendChild( fieldSet );
                var legend = document.createElement( "legend" );
                legend.textContent = target.Name;
                fieldSet.appendChild( legend );
                
                var table = document.createElement('table');
                fieldSet.appendChild( table );


                
                var tr = document.createElement('tr');
                {
                    var td = document.createElement('td');
                    var delButton = document.createElement("button");
                    delButton.textContent = "del";
                    delButton.onclick = function() { deleteTarget( target.Url ); };
                    td.appendChild( delButton );
                    tr.appendChild( td );
                }
                {
                    var td = document.createElement('td');
                    tr.appendChild( td );
                }
                {
                    var td = document.createElement('td');
                    var urlDiv = document.createElement("div");
                    urlDiv.textContent = target.Url;
                    td.appendChild( urlDiv );
                    tr.appendChild( td );
                }

                table.appendChild( tr );

                updateScheduleList( table, target, list );
            });
        });
    } );
}

function addRecTarget() {
    var recUrlObj = document.getElementById( "recUrl" );
    var recNameObj = document.getElementById( "recName" );
    access( "POST", "/rectargets",
            JSON.stringify( { "Url": recUrlObj.value, "Name": recNameObj.value } ),
            responseText => {
                updateTargetList();
            });
}

// ======= schedule

function deleteSchedule( id ) {
    if ( !window.confirm( "削除しますか？ -- " + id ) ) {
        return;
    }
    access( "DELETE", "/schedules", JSON.stringify( {"Id":id} ),
            responseText => {
                updateTargetList();
            });
}

function newCombobox( strList, defaultStr ) {
    var select = document.createElement("select");
    strList.forEach( ( str, index ) => {
        var option = document.createElement("option");
        option.text = str;
        option.value = str;
        select.appendChild(option);
        if ( str <= defaultStr ) {
            select.selectedIndex = index;
        }
    });
    return select;
}

function updateScheduleList(table, target, list ) {
    list.forEach( schedule => {
        if ( schedule.Url == target.Url ) {
            var tr = document.createElement('tr');
            {
                var td = document.createElement('td');
                tr.appendChild( td );
            }
            {
                var td = document.createElement('td');
                var delButton = document.createElement("button");
                delButton.textContent = "del";
                delButton.onclick = function() { deleteSchedule( schedule.Id ); };
                td.appendChild( delButton );
                tr.appendChild( td );
            }
            {
                var td = document.createElement('td');
                var urlDiv = document.createElement("div");
                // var date = new Date( schedule.Year, schedule.Month, schedule.Day,
                //                      schedule.Hour, schedule.Min );
                // urlDiv.textContent = date.toLocaleString() + " -- " + schedule.Duration + "min";
                var date = new Date( schedule.Time )
                urlDiv.textContent = date.toLocaleString() + " -- " + schedule.Duration + "min";
                td.appendChild( urlDiv );
                tr.appendChild( td );
            }
            table.appendChild( tr );
        }
    });

    // 予約追加用フォーム
    var tr = document.createElement('tr');
    {
        var td = document.createElement('td');
        tr.appendChild( td );
    }
    var addButton = document.createElement("button");
    {
        var td = document.createElement('td');
        addButton.textContent = "add";
        td.appendChild( addButton );
        tr.appendChild( td );
    }
    {
        var td = document.createElement('td');
        var group = document.createElement('div');
        var addText = function( txt ) {
            var work = document.createElement( "span" );
            work.textContent = txt;
            group.appendChild( work );
        };

        var now = new Date();
        var yearObj = newCombobox(
            [ now.getFullYear(), now.getFullYear() + 1 ], now.getFullYear() );
        var monthObj = newCombobox(
            Array.from(Array(12), (v, k) => k + 1), now.getMonth() + 1 );
        var dateObj = newCombobox(
            Array.from(Array(31), (v, k) => k + 1), now.getDate() );
        var hourObj = newCombobox(
            Array.from(Array(24), (v, k) => k), now.getHours() );
        var minObj = newCombobox(
            Array.from(Array(12), (v, k) => k * 5), now.getMinutes() );

        var durationObj = newCombobox(
            [1].concat( Array.from(Array(10), (v, k) => (k+1) * 30) ), 180 );
        
        group.appendChild( yearObj );
        addText( "年" );
        group.appendChild( monthObj );
        addText( "月" );
        group.appendChild( dateObj );
        addText( "日" );
        group.appendChild( hourObj );
        addText( "時" );
        group.appendChild( minObj );
        addText( "分" );

        group.appendChild( document.createElement( "br" ) );
        
        addText( "最大時間" );
        group.appendChild( durationObj );
        addText( "分" );
        td.appendChild( group );
        tr.appendChild( td );

        addButton.onclick = function() {
            addRecSchedule( target, Number( yearObj.value ),
                            Number( monthObj.value ), Number( dateObj.value ),
                            Number( hourObj.value ), Number( minObj.value ),
                            Number( durationObj.value ) );
        };
        
    }
    
    table.appendChild( tr );
}

function addRecSchedule( target, year, month, day, hour, min, duration ) {
    var date = new Date( year, month - 1, day, hour, min );
    access( "POST", "/schedules",
            JSON.stringify( {
                "Url": target.Url,
                "Name": target.Name,
                "Time": date.toISOString(),
                "Duration": duration
            } ),
            responseText => {
                updateTargetList();
            });
}

function setSleep() {
    accessToGet( "/misc", responseText => {
        var misc = JSON.parse(responseText);
    
        var sleep = document.getElementById( "sleep" );
        toSleepTime = new Date();
        toSleepTime.setMinutes( toSleepTime.getMinutes(), 60 * Number( sleep.value ) );
        misc.ToSleepTime = toSleepTime.toISOString();
        access( "POST", "/misc", JSON.stringify( misc ),
                responseText => {
                    updateSleepTime();
                } );
    } );
}

function reqPing() {
    access( "POST", "/publish", null, null );
}

function reqExit() {
    if ( window.confirm( "制御を停止しますか？" ) ) {
        access( "POST", "/publish?req=exit", null, null );
    }
}

function reqStop() {
    if ( window.confirm( "録画を停止しますか？" ) ) {
        access( "POST", "/reqStop", null,
                responseText => {
                    updateReqStop();
                } );
    }
}

function updateReqStop() {
    accessToGet( "/reqStop", responseText => {
        var reqStopCountObj = document.getElementById( "reqStopCount" );
        var jsonObj = JSON.parse( responseText );
        reqStopCount.textContent = jsonObj.StopReqCount;
    });
}



function updateSleepTime() {
    accessToGet( "/misc", responseText => {
        var misc = JSON.parse(responseText);
        if ( misc.ToSleepTime ) {
            var date = new Date( misc.ToSleepTime );
            var now = new Date();
            if ( date > now ) {
                var toSleepTime = document.getElementById( "toSleepTime" );
                toSleepTime.textContent = "〜 " + date.toLocaleString();
            }
        }
    });
}

function reloadEtc() {
    accessToGet( "/etc", responseText => {
        var info = JSON.parse(responseText);
        var statusObj = document.getElementById( "status" );
        statusObj.textContent = info.Status.Status;
        var lastAccessTimeObj = document.getElementById( "lastAccessTime" );
        lastAccessTimeObj.textContent = info.LastAccessTime.Time;
        var remoteAddressObj = document.getElementById( "remoteAddress" );
        remoteAddressObj.textContent = info.LastAccessTime.RemoteAddress;
    });
}

window.onload = function() {
    reloadEtc();
    updateReqStop();
    updateTargetList();
    updateSleepTime();
};
