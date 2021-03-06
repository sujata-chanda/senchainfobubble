Ext.define('mapinfobuble.controller.App', {
    extend:'Ext.app.Controller',
    config:{
        refs:{
            // Containers
            map: 'map[name="infoMap"]',
            infoMap : 'infomap',
            details: 'details',
            main: 'main',
            
            // Button
            backToMap: 'button[name="backBtnToMap"]'
        },
        
        control: {
            map: {
                maprender: function(thisOb, map, eOpts) {
                    var me = this;
                    me.map = map;
                    Ext.Function.defer(me.loadMarker, 500, me);
                }
            },
            
            backToMap: {
                tap: function() {
                    this.getMain().animateActiveItem(this.getInfoMap(), {
                        type:'slide',
                        direction: 'right'
                    });
                }
            }
        }
    },
    
    launch: function() {
        Ext.getStore('Places').load();
    },
    
    /*
     * Function responsible for all the marker and infobubble handling
     **/
    
    loadMarker: function() {
        var me = this,
        latlngbounds = new google.maps.LatLngBounds(),
        position, marker,
        map = me.map,
        store = Ext.getStore('Places'),
        ib = new InfoBubble({
            hideCloseButton: true,
            disableAutoPan: true,
            maxHeight: 110
        });
        
        store.each(function(rec) {
            position = new google.maps.LatLng(rec.get('latitude'), 
                rec.get('longitude'));
                    
            marker = new google.maps.Marker({
                position : position,
                map : map,
                data : rec
            });        
                    
            /*
             * Showing InfoBubble   
             **/
            (function(data, selfMarker) {
                google.maps.event.addListener(selfMarker, 'mousedown', 
                    function(event) {
                        ib.record = {
                            places : data																
                        };
                    
                        ib.setContent([
                            '<div class="infobox">' , 
                            '<div class="content">',
                            data.get('description'),
                            '</div>',
                            '<img src="resources/images/arrow.png">',
                            '</div>'
                            ].join(''));
                        
                        /*
                     * center the map on the marker position
                     **/
                        map.setCenter(selfMarker.position);
                    
                        ib.open(map, this);
                    
                        google.maps.event.addListener(map, 'mousedown', 
                            function(){
                                ib.close();
                            });
                    
                        /*
                     * Tap on InfoBubble handled here
                     **/
                        google.maps.event.addDomListener(ib.bubble_, 'click', 
                            function(e){
                                if(!me.getDetails()){
                                    me.getMain().add({
                                        xtype:'details'
                                    });
                                }
                                me.getMain().animateActiveItem(me.getDetails(),{
                                    type:'slide'
                                });
                                                                     
                                me.getDetails().setData(ib.record.places.data);
                            });
                    });
            }(rec, marker));
                        
            latlngbounds.extend(position);
                   
            map.fitBounds(latlngbounds);
        }, me);
    }
});