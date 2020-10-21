// 这一版，改造之后，RENDER_TO_DOM 的这个range,我们就有了可以重新渲染的能力。
// 这样就完成了一个基于range的这样的一个DOM绘制之后。
// 接下来，就可以考虑如何去实现重新的绘制了。
// 特别一提，这个重新绘制，对于我们的下一个步骤，就是我们的虚拟Dom，也是至关重要的。
//  如果没有重新绘制的话，其实也就没有虚拟Dom什么事了，
//  如果只是绘制一遍的话，其实它不存在虚实Dom比对的这样的一个事情。
//所以说，接下来的改造，就是要给组件加入，重新绘制和渲染的能力。

// Symbol 是不用 new 的，
const RENDER_TO_DOM = Symbol("render to dom");

class ElementWrapper {
    constructor(type) {
       this.root = document.createElement(type);
    }

    setAttribute(name,value) {
       this.root.setAttribute(name,value);
    }

    appendChild(component) {
    /**
        这里我们也是要改的，这个里面的 appendChild 同样用了一个 root ,所以这个地方，我们应该用底部
     render 的修改手法， 我们需要创建一个range ,因为我没有 root 可用了，我们需要创建一个 range ,
     然后我们把它的 component 给它渲染进去， 注意这个 range ,因为我们是 appendChild ,所以说它
     一定是放在最后的， parentElement 那么变成 this.root ,
    **/
        let range = document.createRange();
        range.setStart(this.root,this.root.childNodes.length);
        range.setEnd(this.root,this.root.childNodes.length);
        component[RENDER_TO_DOM](range);
        // this.root.appendChild(component.root);
    }

/**
    因为这个地方传进来的是一个 range ,所以说我们这个地方有 root 的情况下，
 我们就是点 range.deleteContents(); 我先把它的内容给它删掉，然后我们再
 给它 range.insertNode(this.root) ，
    TextWrapper 里面，逻辑应该是差不多的，大家要注意这块的改造，我们是有一个
 非常长的周期是没有办法调试的，因为很多代码都会改掉，
**/
    [RENDER_TO_DOM](range) {
       range.deleteContents();  // 内容给它删掉
       range.insertNode(this.root);
       // this.render()[RENDER_TO_DOM](range);
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content);
    }

    [RENDER_TO_DOM](range) {
        range.deleteContents();  // 内容给它删掉
        range.insertNode(this.root);
    }
}

/**
    我们要想实现 main.js 描述的这个机制，我们首先在 Component 的。。。，  我们首先要看，然后 constructor 里面，它肯定有一个State
 但是整个 State ,我可能倾向于让这个 MyComponent ,也就是说继承这个 Component 的这个，自己来实现，对它进行赋值啊，什么， 因为它跟render
 其实是同一组，这样的话，我们在 MyComponent 里面加上 constructor,
 **/

/**
    我们这里看到它去取 root 的过程，实际上就是一个真实的渲染过程，那么 Component 这里面呢，
 我们会有一个去取root 的过程，我们这里是用一个 this.render 的 root ,那么它如果说 render
 回来的结构，它是一个 Component 的子类，那么它就会对 root 进行一个递归的调用，如果它不是
 Component 的一个子类，那么它最后终究要变成 ElementWrapper 或者是 TextWrapper ,这两个
 都是真正的有 root 的情况，
    所以说其实在我们的这个结构里面，root 其实是一个跟渲染相关的东西，但是如果我们想要实现更新
 的话，那么我们就没有办法去做 root 的更新，所以说我们是需要写一个函数，这个函数其实应该是一个
 私有的，比如我们在这儿写成 _renderToDom ,这个时候，我们是需要给它一个参数的，给它一个参数，
 其实你会发现，我们每次把 Component 创建出来，然后去给它做这个 render ,其实这里面，我们是
 需要去调用到，它的一个具体的位置的，那么这个具体的位置，如果我们在这里面传一个 Element,那么
 我们是这个位置是指定的不够精确的，因为我们有可能是在 Element 的中间，我们要重新渲染的话，它
 就不一定是插到最后了，所以我们其实 render 这个方法，也是一个，其实我们应该全称教它 renderDOM,
 这个地方我们就要给它传一个位置，DOM API 里面，
    什么API 是跟位置对应， range API，这里我们不是 TS ，但是我们仍然可以在，变量名上面把它
 写对，这里我们写一个 range ,那么传一个 range 进来，那么我们就可以使用range API，去对它进
 行操作和重新渲染了。
 **/
export class Component{
    constructor() {
       this.props = Object.create(null);
       this.children = [];
       this._root = null;
    }
    setAttribute(name,value) {
       this.props[name] = value;
    }
    appendChild(component) {
       this.children.push(component);
    }
/**
    这个地方，整个的结构就都会去改一下，我们不再用 root 进行操作了，我们整个的脑子里面，思想
 要发生变化，不再用root进行操作，我们从取一个元素变成了，把它渲染进一个 range 里面，所以这个
 地方，实际上会是一个 this.render，  它仍然是一个递归的调用，如果组件本身，没有去 override
 的 renderToDOM 的方法，那么我们就认为，它是一个这样的一个结构。
    这里用下划线表示 它是私有。   更好的方式其实是用一个 Symbol，在没有 Private
 Field 之前，那么最好的解决方案，肯定是用 Symbol 来处理。
    这里我们这样写 [RENDER_TO_DOM] ，可能有些同学对这个写法有点陌生，这里我们如果
 是用字符串的话，不管是 class 里面，还是 object 里面，我们都可以用方括号的形式，来
 代替这个名字，来表示 它是一个 里边是一个变量，所以说，相当于我把 render to dom
 这个 Symbol 给它放到这里，之后我们可能会用某种方式去把它 export 出去，但是无论如何，
 我们用这种方法是会让它变得不太容易被访问到，然后 RENDER_TO_DOM 它会是一个递归的
 这样的一个过程，那我们把这个地方改成方括号，然后这样，我们就把这个 get root 给它
 删掉， 然后对应的，我们需要给 ElementWrapper 和 TextWrapper 添加上 RENDER_TO_DOM
 这个方法。
 **/

    // _renderToDom(range) {
    [RENDER_TO_DOM](range) {
        this.render()[RENDER_TO_DOM](range);
        // this.render()._renderToDOM(range);
    }

    // get root(){
    //     if(!this._root){
    //         this._root = this.render().root;
    //     }
    //     return this._root;
    // }
}

export function createElement(type,attributes,...children){
    let e;
    if(typeof  type === "string"){
        e = new ElementWrapper(type);
    }else{
        e = new type;
    }
    for(let p in attributes){
        e.setAttribute(p,attributes[p]);
    }
    let insertChildren = (children)=>{
        for(let child of children){
            if(typeof child === 'string'){
                child = new TextWrapper(child);
            }
            if( (typeof  child === "object") && (child instanceof Array) ){
                insertChildren(child);
            }else{
                e.appendChild(child);
            }
        }
    };
    insertChildren(children);
    return e;
}


/**
    最后的这个 render 这个函数里面也要变化，那么我们要给它写成
 component.render()[RENDER_TO_DOM](range);  ，我们不需要再调用它的 .render
 了，我们就直接调用它的 RENDER_TO_DOM 就可以了，这个时候，这个range 怎么来，那么，
 它既然有了 parentElement ,那么我们是可以在 parentElement 的尾巴上面，给它加上
 range 的，这个地方就是看怎么样设计这个 render 语义，如果我们的 render 认为，要把
 整个 Element 的，parentElement 里面的内容给它替换掉，那么我们是应该把 parentElement
 给它清空的，
 我们首先创建这个 range , let range = document.createRange(); 它这个range
 是由一个 Start 的节点 和 一个End 的节点组成的，
 range.setStart(parentElement,0);
 Start的节点，我们肯定选parentElement，Offset 我们就选0 好了，选0的话，那么它就是
 从 Element 的第一个 children 到最后一个 children .
 我们还要把它的 content 给它删掉， setEnd 的时候，我们不能再选0了，我们要选childNodes的长度，
 注意：这个地方不能是children，因为我们parentElement 里面，是可能有文本节点和注释节点的，我们要把它首尾都设成正确的值。
    然后这个时候，我们给它的 range 里面，给它 deleteContents ，这样，我们就把 range 里面的东西给它删干净了，然后我们
 再给它 Component 里面的东西，给它渲染进去，这个就是我们 render 里面的代码了。

 **/
export function render(component,parentElement){
    let range = document.createRange();
    range.setStart(parentElement,0);
    range.setEnd(parentElement,parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range);

    // parentElement.appendChild(component.root);
}









