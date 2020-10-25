
/**

 **/
import {createElement,Component,render} from "./toy-react.js";

class Mycomponent extends Component{
    constructor(){
        super();
        this.state ={
            a:1,
            b:2
        }
    }
    render(){
        return <div>
              <h1>my component sss</h1>
              <button onclick={ ()=>{ this.setState({a:this.state.a+1 }) }  } >add</button>
              <span> {this.state.a.toString()} </span>
              <span> {this.state.b.toString()} </span>
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



