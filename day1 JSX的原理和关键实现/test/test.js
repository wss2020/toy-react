function createElement(type,attributes,...children){
    let e;
    if( typeof type == "string" ){     // type 是 string ，把它当成普通 element 去处理
        e = document.createElement(type);    //创建一个由标签名称 tagName 指定的 HTML 元素。如果用户代理无法识别 tagName，
                                             // 则会生成一个未知 HTML 元素 HTMLUnknownElement。
    }else{
        // 当 type 是一个我们自己自定义的 class（类） 的时候，我们无论如何也没有什么办法，把它变成一个真正的 DOM 对象，
        // 所以我们必须要对前面的 document.createElement 的这个行为，进行一定的封装，
        // 我们有一个办法，就是给所有的原生 DOM 对象加一个 wrapper ,加一个 wrapper 之后,我们就可以正确的去执行，
        // 在改变 wrapper 之前，我们就有分文件的需求了。
        e = new type;
    }

    for(let p in attributes){
        e.setAttribute(p,attributes[p]);     //设置指定元素上的某个属性值。如果属性已经存在，则更新该值；
                                                  // 否则，使用指定的名称和值添加一个新的属性。
    }

    for(let child of children){     // ...children ,三个点获取过来的，会把它作为一个数组去处理
        if(typeof child === 'string'){
            child = document.createTextNode(child);   //创建一个新的文本节点。这个方法可以用来转义 HTML 字符。
        }
        e.appendChild(child);
    }

    return e;
}

/**
    JSX 里面有一个特殊的规定，如果你的标签名是小写，那就会认为你是一个原生的标签名，如果一旦我给 div 改一个名字，
 这个时候，编译出来的，就是我们自己定义的对象或者是 class ,一般认为我们编译出来的是一个 class ,二呢，根据最新的
 host API ，那么这个东西也可以是函数，我们这里就先尝试 class API 的这样的一种写法。
 **/

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







