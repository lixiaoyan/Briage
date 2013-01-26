Briage().add(function(B){
    B.extend(B.DOM.Element.prototype,{
        slide:function(config){
            if(!this.getCustomData("slide")){
                config=B.extend({
                    width:600,
                    height:400,
                    images:[],
                    time:5000
                },config,true,true);
                this.setSize(config.width,config.height);
                var position=this.getStyle("position");
                if(!(position=="absolute" || position=="fixed")){
                    this.setStyle("position","relative");
                }
                var navbar=this.getDocument().create("div");
                navbar.setStyles({
                    "z-index":"2",
                    "position":"absolute",
                    "right":"0",
                    "bottom":"0",
                    "overflow":"hidden",
                    "zoom":"1"
                });
                this.append(navbar);
                var navs=[];
                var images=[];
                var self=this;
                B.each(config.images,function(k,v){
                    var image=self.getDocument().create("img");
                    image.setStyles({
                        "z-index":"1",
                        "position":"absolute",
                        "width":"100%",
                        "height":"100%",
                        "left":"0px",
                        "top":"0px"
                    });
                    image.setAttr("src",v);
                    image.hide();
                    images.push(image);
                    self.append(image);

                    var nav=self.getDocument().create("a");
                    nav.setStyles({
                        "float":"left",
                        "padding":"5px",
                        "background":"#f00",
                        "border":"1px solid #000"
                    });
                    nav.setAttr("href","#"+k);
                    nav.setHTML(k+1);
                    nav.bind("click",function(e){
                        to(k);
                        e.preventDefault();
                    });
                    navs.push(nav);
                    navbar.append(nav);
                });
                var count=-1;
                var temp=0;
                var playing=true;
                var to=function(index){
                    if(index==count){
                        return;
                    }
                    index=index%config.images.length;
                    images[count] && images[count].hide();
                    navs[count] && navs[count].setStyle("background","#f00");
                    images[index] && images[index].show();
                    navs[index] && navs[index].setStyle("background","#ff0");
                    count=index;
                    temp=0;
                };
                to(0);
                var timer=new B.Timer();
                timer.setInterval(100);
                timer.setHandle(function(){
                    if(playing){
                        temp++;
                        if(temp>=config.time/100){
                            to(count+1);
                        }
                    }
                });
                timer.start();
                var slide={};
                slide.change=function(index){
                    to(index-1);
                };
                slide.start=function(){
                    playing=true;
                };
                slide.stop=function(){
                    playing=false;
                };
                this.setCustomData("slide",slide);
            }
            return this.getCustomData("slide");
        }
    });
},"slide",["dom","event","timer"]);