"use strict";

// 0：显示问题 后面是一对出现，第一条是回复，第二条是回复后的显示问题以及奖励 后面是属性加数值，代表奖励内容
window.talkData = {
	fruit: [ "发现了一些野生的蔬菜",

			 "直接生吃",
			 "感觉体质变好了，但上面的很多细菌还是把肚子吃坏了 maxHp 5 hp -10",

			 "煮熟再吃",
			 "不小心煮的太熟了，营养都煮没了，但还是吃得很饱 hp 20",

			 "没胃口",
			 "生吃肯定不好，但自己做的黑暗料理，自己都怕，还是溜了"
		  ],

    gamble: [ "有兴趣来赌一把吗？赔率都特别高，就赌大小",

    		  "10金币赌小，赔率为1：4",
    		  "很遗憾，你猜错了，欢迎下次再来 coin -10",

    		  "10金币赌大，赔率为1：4",
    		  "很遗憾，你猜错了，欢迎下次再来 coin -10",

    		  "10金币赌大，另外10金币赌小",
    		  "还以为出千厉害就可以骗人钱，想不到吃了数学的亏，现在无论大还是小，我都亏20金币 coin 20"
    	],

    thief: [ "我的5个妈妈和10个孩子都重病在床，急需医药费，我的这个技能卡贱卖给你，只要5金币",

    		"好感动，但这个价格我更心动，直接买了",
    		"非常感谢你，你是一个好人 coin -5 card 1",

    		"好假啊，这怎么看都是赃物，直接举报",
    		"警察直接带走了这个小偷，还获得了10金币举报费 coin 10",

    		"感觉很可疑，还是不要理会他好",
    		"虽然还是很在意，但我还要拯救世界，还是不要节外生枝好"
    	],

    
};