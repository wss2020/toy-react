
const RENDER_TO_DOM = Symbol("render to dom");

export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
        this._range = null;
    }

    setAttribute(name, value) {
        this.props[name] = value;
    }

    appendChild(component) {
        this.children.push(component);
    }

    get vdom() {
        return this.render().vdom;
    }

    [RENDER_TO_DOM](range) {
        this._range = range;
        this._vdom = this.vdom;
        this._vdom[RENDER_TO_DOM](range);
    }

/**
    首先rerender 的代码，可以退休了，因为我们不再是重新渲染了，我们是更新，那么 VDOM 的创建和比对的逻辑，都会在
 Component 基类里面去实现，所以说我们主要的更新部分都会在这个里面，所以我们可以把这个rerender 先给它去掉啊，然后
 我们来考虑，如何去实现我们的 VDOM比对，
    那么我们写一个 update 方法，这里面有一个重要的知识，就是 RENDER_TO_DOM 的逻辑 render 了之后，它一定要更新，
 因为它一定要更新，所以说我们这里，就会给它这个 RENDER_TO_DOM 里面的，当时用的这个 vdom ,我们把它存下来，
 this._vdom = this.vdom; 注意这个vdom 是个 get ,所以说这个地方会重新render 并且得到一棵新的 vdom 树，而
 this._range = range;this._vdom = this.vdom; 这个地方它的 RENDER_TO_DOM 的部分，我们就会用 this.vdom
 来执行啊，这样 this._vdom , 它就会充当旧的 vdom ,
    而在 update 里面，我们就把一棵新的 vdom 跟上次渲染得到的旧的vdom ,我们去做一个对比，然后对比之后，然后来决定
 哪一个树的子树，我们要去做重新渲染，我们这里会用一个比较简单的这样的 VDOM 这样的对比算法，就是我们只对比对应位置的VDOM,
 它是不是同一个类型的节点，如果是，我们就进行了，如果它不是，或者说它比如说两个节点调换了顺序，这个 React 里面是可以处理的，
 它会用一个更好的 VDOM 对比算法，那我们今天呢VDOMDiff 了， 因为我们主要还是要给大家讲解 VDOM 的原理。
    update 里面我们可能需要递归地去访问 vdom 的内容，所以说 我们要写一个函数，update ,它会把一棵新的和旧的（节点）给它
 去更新，我们来考虑怎么样写这个 update , 首先是调用 update 的地方，还是在 setState 里面，你那 setState 变了，render
 的结果就可能变，所以我们才需要对比，好，然后我们到 update 里面去看，旧的 vdom 是这个 this._vdom, 新的 vdom 是新渲染出
 来的这个 vdom ,我们需要把新渲染出来的vdom ,给它存一下，
    然后update 了之后，我们就可以认为，它现在已经更新到，这颗新的 vdom 了，所以我们要把旧的这个，给它替换掉，所以 update
 里面的主体逻辑大概就是这个样子，update 里面，我们来考虑一下，两颗树的对比，旧的 和 新的，那么我们肯定首先对比它的根结点，它
 的根节点，我们有几个要素去对比，我们可以简单地列一下啊，
    首先我们要对比它的type ,如果它的 type 不一致的话，那么我们就认为它是完全不同类型的子节点，所以它在这些子树，什么子节点，
 什么的也都没有复用的价值了，完全地重新重构就可以了，
    然后就是它的 props ,props 不一样，那么其实是我们可以通过打 patch 的方式去更改的，因为我们的 vdom 树里面全是
 ElementWrapper , 这样的老实的节点，所以它不会有什么特殊的逻辑，这样我们可以把这个 props 打 patch ，但是我们这里，
 也去，就是简化这个逻辑，那么如果 props 不一样，我们也认为它根节点不一样，只用根节点的 type 和 props 完全一致，那么
 我们认为这个根节点是不需要更新的，然后我们再去看它的所有的子节点是不是需要更新，然后我们再去看它的 children ，值得注
 意的是，一旦 types 是 text 的时候，我们还需要看 content , 而这个 content 其实我们也是可以去通过 patch 的方式，
 去更新的啊，这里我们也用一个直接的这种 replace 的方式，所以说这个逻辑，我们就大概梳理清楚了。
    所以我们这个逻辑会分成两段，第一段是对比这个根节点是否一致的，第二段是对比它的 children 是否一致的，而这个对比
 children 是否一致，正是各种各样的这种 Diff 算法，它们登场的舞台，这里我们就用一个最土的同位置的比较的方法，它也能
 实现局部更新，好，我们来看，根节点怎么对比。

    这里我们就用一个最土的同位置的比较方法，它也能实现局部更新，我们先来看根节点怎么对比，
 我们这里，把根节点对比单独地抽出一个函数来，这样我们比较方便去处理，它要返回一个 true 或
 者false ,我们最后默认 return true ,前面一旦我们找到不一样的，我们就给它短路 return
 false 掉，
    类型不同，节点不同，然后是属性不同，注意凡涉及 props 的，  如果属性值不一致的话，那么
 我们认为它是不同的，然后还有一个就是，如果旧的属性比新的属性多，那么我们也认为它是不同的，
    好，最后是文本节点，我们要对比它的，这个 content ,节点对比的逻辑,大概就是这样啊。
    我们再从头梳理一下，类型不同，属性不同，属性的数量不同，文本节点的内容不同，那么我们就
 认为它是不同的节点，那么我们就会做一个 replace 。

    然后接下来，我们来继续回到我们的 update 里面，如果他们不是一样的 Node 的话，那么我们
 就会直接对，这个 oldNode 做一个覆盖，怎么覆盖，那么把 oldNode 的 range ,给它取出来，
 给它替换掉就行了，我们就调用 RENDER_TO_DOM 这个方法，这个时候就体现 range 的好处了，
 oldNode 不管它在哪个位置，那么我们就可以把它的 range 直接给它替换掉，这个是一个不同的逻辑。
 我们就直接return 了，这是等于一个完全的全新渲染，因为新旧节点不一样，
    然后如果新旧节点一样，那么我们就会把 oldNode 的 range ,给它强行地设置为 newNode 的
 range ,我们注意啊，如果说 Node ,它不是 ElementWrapper ，那么肯定是不对的，它只有是
 ElementWrapper 的时候，才可以这样干，否则的话，它里边如果有逻辑，它就会出问题，你也说不清，
 它的 children 在组件里边会怎么用，那么我们这样就可以看，它的 newNode 和 oldNode 是否
 相同，
    接下来我们就开始处理 children 的问题，我们注意， newNode.children 这个属性，它里边
 放的是什么，它里边放的是 Component ,所以说我们需要一个 vchildren , oldChildren 其实
 你要拿的也是它的 vchildren ,那么这个 vchildren ,我们来看一下，其实我们 ElementWrapper
 上是没有这个逻辑的，所以怎么办，我们需要把这个逻辑给它加上去，因为这个 new 的这个 children
 这个 vchildren ,它是靠 get vdown 这个逻辑取出来的啊，所以说，我们为了加上这个东西，我们
 只能在 vdom 这个逻辑的地方加上，
 **/
/**
    好,下面的ElementWrapper 修改完成之后，然后所有的 child 都会是 ElementRapper 这个
 类型的东西，然后这个时候，我们的newChild的里面，我们就去循环 newChildren ,
    然后我们去看，oldChildren 里面是不是有这个东西，所以这个地方，我们用 for of 是不行的，
 因为他是个双数组同时循环，所以我们换回最传统的 for 循环，我们取一个newChild等于 newChild[i]
 再取一个 oldChild ，实际上 newChildren.length 是可能长于 oldChildren 的，我们这个地方
 继续去处理一下啊， 我们暂时不写 else ,不写 else 就意味着我们没有办法往上添加东西，这个else
 我们留一个 TODO，晚一点我们再写 ，那么这个时候，我们就选择递归地调用自己，
    这样的话，我们就基本完成了代码的结构，那么让我们来运行起来。
 **/
/**
    我们把 TODO 里的代码补全
    如果 oldChildren 的数量小于 newChildren 的数量，那么我们在这个地方，就会需要去执行一个插入，
 那么这个地方，插入有点麻烦，因为我们需要知道，oldChildren 的最后一个，它边缘的这样的一个位置，所以
 我们需要在这个地方，加一个 let tailRange ,我们一开始让它等于 oldChildren 的最后一个，然后我们
 需要让它这个 range ,设到这个 range 的尾巴上去，
    那么，所以我们这个时候要在这个地方，创建一个插入的range ,插入的range 会用 tailRange 的尾巴，
 就是我们在这个等于说我们在 range 的最后插一些东西，那么这个 tailRange ,所以说我们会给它的 Start End
 都设成 tailRange 的 end ,
    这个 Start 和 End 是一样的，因为这个 range 是我们用来插入的一个空的 range ,然后接下来我们
 给这个range ,我们还是用 replace 的逻辑好吧，反正同时空的无所谓，我们直接用 newChild 的
 RENDER_TO_DOM， RENDER_TO_DOM 然后这个地方我们就给出一个。
    这样的话，我们就把 newChild 给它追加到这个后边了，这个时候，如果我们再有 newChild 怎么办，
 这个 newChild ,它肯定要继续往后边追加，那么所以我们要给它 tailRange 给它改掉，
 tailRange = range;
 **/
    update() {
        let idSameNode = (oldNode, newNode) => {
            if(oldNode.type !== newNode.type)
                return false;
            for (let name in newNode.props) {
                if (newNode.props[name] !== oldNode.props[name]) {
                    return false;
                }
            }
            if( Object.keys(oldNode.props).length > Object.keys(newNode.props) )
                return false;
            if(newNode.type === "#text"){
                if(newNode.content !== oldNode.content)
                    return false;
            }
            return true;
        }
        let update = (oldNode, newNode) => {
            // type, props, children
            // #text
            if(!idSameNode(oldNode,newNode)){
                newNode[RENDER_TO_DOM](oldNode._range);
                return;
            }
            newNode._range = oldNode._range;

            let newChildren = newNode.vchildren;
            let oldChildren = oldNode.vchildren;

            // 如果没有 Children 的话，我们就直接给它 return 掉好了。
            if(!newChildren || !newChildren.length){
                return ;
            }
            let tailRange = oldChildren[oldChildren.length - 1]._range;

            // for(let child of newChildren){}
            for(let i=0; i<newChildren.length; i++){
                let newChild = newChildren[i];
                let oldChild = oldChildren[i];
                if(i < oldChildren.length){
                    update(oldChild,newChild);
                }else{
                    let range = document.createRange();
                    range.setStart(tailRange.endContainer, tailRange.endOffset);
                    range.setEnd(tailRange.endContainer, tailRange.endOffset);
                    newChild[RENDER_TO_DOM](range);
                    tailRange = range;
                    // TODO
                }
            }
        }
        let vdom = this.vdom;
        update(this._vdom, vdom);
        this._vdom = vdom;
    }
    // rerender() {
    //     let oldRange = this._range;
    //     let range = document.createRange();
    //     range.setStart(oldRange.startContainer, oldRange.startOffset);
    //     range.setEnd(oldRange.startContainer, oldRange.startOffset);
    //     this[RENDER_TO_DOM](range);
    //
    //     oldRange.setStart(range.endContainer, range.endOffset);
    //     oldRange.deleteContents();
    // }

    setState(newState) {
        if (this.state === null || typeof this.state !== "object") {
            this.state = newState;
            this.rerender();
            return;
        }
        let merge = (oldState, newState) => {
            for (let p in newState) {
                if (oldState[p] === null || typeof oldState[p] !== "object") {
                    oldState[p] = newState[p];
                } else {
                    merge(oldState[p], newState[p])
                }
            }
        };
        merge(this.state, newState);
        // this.rerender();
        this.update();
    }
}

/**
     接下来我们来看一看我们，setAttribute 和 appendChild 里面做的事情，我们就要让它在 RENDER_TO_DOM 这个
 里面去做，
 **/
/**
    我们来看一下，其实我们 ElementWrapper
 上是没有这个逻辑的，所以怎么办，我们需要把这个逻辑给它加上去，因为这个 new 的这个 children
 这个 vchildren ,它是靠 get vdown 这个逻辑取出来的啊，所以说，我们为了加上这个东西，我们
 只能在 vdom 这个逻辑的地方加上，this.vchildren = this.children.map();
 这样我们就可以保证，任何一个 vdom 属性的这个树里面取出来，它的 children 都是有 vchildren
 这个属性的，这实际上也是一个递归调用，它要把它所有的 children ,也都变成它的 vdom 树，这样
 我们取出来的 vdom 树，一次性取出来的就是一棵完整的 vdom 树，
    然后后面的循环就是对 vchildren 了，这样的话，它才是一棵真正的虚拟DOM 树的操作，这个地方
 为了我们确保 vchildren 一定存在，所以我们加一个判断，ensure 了一下它这个地方是有vchildren
 的，这样可以避免一些麻烦，如果我上来就直接 RENDER_TO_DOM ，没有取过 vdom ,那么这个地方就可
 以处理，
    好，然后所有的 child 都会是 ElementRapper 这个类型的东西，然后这个时候，我们的newChild
 的里面，我们就去循环 newChildren ,
 **/
class ElementWrapper extends Component {
    constructor(type) {
        super(type);
        this.type = type;
        this.root = document.createElement(type);
    }

    get vdom() {
        this.vchildren = this.children.map(child => child.vdom);
        return this;
    }

    /**
        range 这里也需要保存一下
     **/
    [RENDER_TO_DOM](range) {
        this._range = range;
        // range.deleteContents();

        let root = document.createElement(this.type);

        for (let name in this.props) {
            let value = this.props[name];
            if (name.match(/^on([\s\S]+)/)) {
                root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
            } else {
                if (name === "className") {
                    root.setAttribute("class", value);
                } else {
                    root.setAttribute(name, value);
                }
            }
        }

        if(!this.vchildren)
            this.vchildren = this.children.map(child => child.vdom);

        // for (let child of this.children) {
        for (let child of this.vchildren) {
            let childRange = document.createRange();
            childRange.setStart(root, root.childNodes.length);
            childRange.setEnd(root, root.childNodes.length);
            child[RENDER_TO_DOM](childRange);
        }
        replaceContent(range,root);
        // range.insertNode(root);
    }

}

class TextWrapper extends Component {
    constructor(content) {
        super(content);
        this.type = "#text";
        this.content = content;
        // this.root = document.createTextNode(content);
    }

    get vdom() {
        return this;
    }

    // get vchildren() {
    //     return this.children.map(child => child.vdom);
    // }

    /**
     range 这里也需要保存一下
     **/
    [RENDER_TO_DOM](range) {
        this._range = range;
        // range.deleteContents();
        // range.insertNode(this.root);
        let root = document.createTextNode(this.content);
        replaceContent(range,root);
    }
}

/**
    此时还存在，它会多删元素的这个 Bug ,这是因为我们的这个，我们的 ElementWrapper 和 TextWrapper
 我们都没有处理 range 先插入后删除的这个东西，因为这个地方，它好几个地方都用到，我们单独写一个单独的封装，
 我们叫 replaceContent ,
    这个 node 会出现在这个 range 的最前面，这个时候我们再把 range.setStartAfter(node); 这个时候我
 们把 range 挪到 Node 之后，然后我们把 range 里面的内容，给它删掉，
    然后删掉了内容，插入了也删除了，但是这个时候 range 不对了，所以我们把 range 设回来，就是这么样的一个
 逻辑，这主要是 range ,它的空 range 的一些比较难处理的情况啊，
    那么在 [RENDER_TO_DOM](range) { } 里面，我们就添加上 replaceContent(range,this.root)； 的
 处理。
    修改好之后，除了 RENDER_TO_DOM 这个私有方法之外，就全都是跟 dom 完全没有关系的， 顺手也把 TextWrapper
 也给它更新掉。
 **/
 function replaceContent(range,node){
     range.insertNode(node);
     range.setStartAfter(node);
     range.deleteContents();

     range.setStartBefore(node);
     range.setEndAfter(node)
}

export function createElement(type, attributes, ...children) {
    let e;
    if (typeof type === "string") {
        e = new ElementWrapper(type);
    } else {
        e = new type;
    }
    for (let p in attributes) {
        e.setAttribute(p, attributes[p]);
    }
    let insertChildren = (children) => {
        for (let child of children) {
            if (typeof child === 'string') {
                child = new TextWrapper(child);
            }
            //加一个逻辑
            if (child === null) {
                continue;
            }
            if ((typeof child === "object") && (child instanceof Array)) {
                insertChildren(child);
            } else {
                e.appendChild(child);
            }
        }
    };
    insertChildren(children);
    return e;
}


export function render(component, parentElement) {
    let range = document.createRange();
    range.setStart(parentElement, 0);
    range.setEnd(parentElement, parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range);
}



/**
  其实我们的 toy-react 和真正的 react ,差距还是比较大的，因为大家都知道 React
 从14版本开始，那么开始使用 Fiber 架构，而新版本又加入了 Hooks 这样的 API ,
 然后在加上虚拟DOM 的 Diff 算法事件中心，这些基本上就是一个工业产品 和 一个讲
 原理的数字产品的区别了，不过希望我们的 toy-react 能够作为大家去阅读 React
 源码也好，编写类 React 的框架也好，能够作为这个的一个基础。
 **/







