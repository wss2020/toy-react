/**
    在 React 里面，其实它会认为我们的 UI 等于一个模版加上一个数据，它这样渲染出来就是一个完整的 UI 了，那么它怎么样去对这个 UI
 进行更改呢？ 那么它是通过对这个数据进行更改，然后再重新地使用 render 这个函数，在我们的现有机制里面，render 是能 render 出来了，
 上一节已经给大家看过，它把这个模版正确地 render 出来，但是呢？ 它一是没有数据来源，二是数据变了之后，我们现在还没有一个很好的机制去
 更新它，那么接下来，我们就来看，怎么样去修改， Component类 和一些 Wrapper ,
    那么也就是说，在我们的 toy-react.js 里的类，能够让我们的自定义组件，它支持 State ,其实 State 说起来是一个简单的东西，那么它就像是
 一个 JavaScript 的普通的对象，这个对象里存了一些数据，而这个对象，它其实并不存在着一些复杂的结构，我们用 Java 的话说，这个叫贫血模型，
 就 State 里面它只有数据，它没有什么函数之类的这些乱七八槽的东西，所以说 State 简单，但是难就难在 setState 上，setState 不但改变了
 State 这个值本身，同时它会启动一个重新 render 的这样的一个动作，然后当你多次 setState 之后，它会在整个生命周期结束的时候，发起一次
 重新的render, 而这次 render 之后呢？ 我们的组件，它就是按照正确的模版去写了，
    我们要想实现这个机制，我们首先在 Component 的。。。

 **/

import {createElement,Component,render} from "./toy-react.js";

class Mycomponent extends Component{
    render(){
        return <div>
            <h1>my component</h1>
            {this.children}
        </div>
    }
}


render(
    <Mycomponent  id='a'  class='c' >
        <div>111</div>
        <div>222</div>
        <div>333</div>
        <div>444</div>
    </Mycomponent>
    ,document.body);




