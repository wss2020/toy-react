

function createElement(type,attributes,...children){

    console.log(type);

    let e = document.createElement(type);    //创建一个由标签名称 tagName 指定的 HTML 元素。如果用户代理无法识别 tagName，
                                                      // 则会生成一个未知 HTML 元素 HTMLUnknownElement。

    for(let p in attributes){
        e.setAttribute(p,attributes[p]);     //设置指定元素上的某个属性值。如果属性已经存在，则更新该值；
                                                  // 否则，使用指定的名称和值添加一个新的属性。
    }
    console.log(111);

    for(let child of children){
        // console.log(child);

        if(typeof child === 'string'){
            child = document.createTextNode(child);   //创建一个新的文本节点。这个方法可以用来转义 HTML 字符。
        }
        e.appendChild(child);
    }

    return e;
}



document.body.appendChild(
       <div id="a" class="c" >
             dsfkjflkdsj

             <font class="div2">abc</font>
             <span class="span1">123</span>
             <p  class="p1">wss</p>
        </div>
)



// for(let i of [1,2,3]){
//     console.log(i);
// }







