module.exports={
    entry: {
        // main:'./test2/test1.js'
        main:'./main.js'
    },


    //module 的 rules 是一个数组，配置一个一个的规则
    module:{
        rules: [

            //第一条规则，所有以.js结束的文件，都给它应用babel-loader
            {
                test:/\.js$/,
                use:{
                    loader:'babel-loader',
                    // loader 的配置，都是通过一个 options 属性来配置
                    // presets 可以理解为一系列Babel的config 的一种快捷方式
                    options: {
                        presets:['@babel/preset-env'],
                        plugins:[['@babel/plugin-transform-react-jsx',{pragma:'createElement'}]]
                    }
                }
            }

        ]
    },


    // 配置可被人类看懂的代码
    mode:"development",
    optimization: {
        minimize: false
    }


}
