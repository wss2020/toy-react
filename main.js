import {createElement,Component,render} from  "./toy-react.js";

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


//1121

// render(
//         <Mycomponent id="a" class="c" >
//              <div class="div">   abc    </div>
//              <p   class="p">     111</p>
//             <span class="span">   222</span>
//         </Mycomponent>
// ,document.body);


