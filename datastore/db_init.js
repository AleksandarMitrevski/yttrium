use yttrium

db.createCollection("users")

var user1 = db.users.insertOne({username: "Test1", password_hash: "57498bd8012a8e30dfbc8b5f598f5a1feb74beda95520e3c77acd2664473c96d", password_salt: "3U4OPi$MXd@Uqzt>Pe?5"}).insertedId;
var user2 = db.users.insertOne({username: "Test2", password_hash: "6645f8285d90711037d667e34a46b0c65ecfc9b729bc93ee8bdc99cb2138e905", password_salt: "WE(T#8Yrre9D8&cws!GN"}).insertedId;
var user3 = db.users.insertOne({username: "Test3", password_hash: "e805b6b0ea925e869ca105e88d0bd8850f4a58d12f9a87adc97aaec9320c435c", password_salt: "Ut{h871e>LqxAMq=T1fC"}).insertedId;
var user4 = db.users.insertOne({username: "Test4", password_hash: "56e39b0ce292ca065bd8bc326a4f7a4bbc8f3ba06731f2077209f9a587c0a4a8", password_salt: "Yy12]IrCU2I.o05I+2_"}).insertedId;

db.createCollection("surveys")

var survey1 = db.surveys.insertOne({created_by: user1, timestamp: new Date(), title: "Recruitment Satisfaction", questions: [
	{
		title: "How professional was your recruiter at our company?",
		options: ["Extremely professional", "Very professional", "Somewhat professional", "Not so professional", "Not at all professional"]
	},
	{
		title: "How knowledgeable was your recruiter about our company?",
		options: ["Extremely knowledgeable", "Very knowledgeable", "Somewhat knowledgeable", "Not so knowledgeable", "Not at all knowledgeable"]
	},
	{
		title: "How clearly did your recruiter explain the details of the job to you?",
		options: ["Extremely clearly", "Very clearly", "Somewhat clearly", "Not so clearly", "Not at all clearly"]
	},
	{
		title: "Did you feel that your recruiter spent too much time, too little time or about the right amount of time speaking with you?",
		options: ["Much too much", "Too much", "The right amount", "Too little", "Much too little"]
	},
	{
		title: "How clearly did your recruiter explain the rest of the recruiting process following your interview?",
		options: ["Extremely clearly", "Very clearly", "Somewhat clearly", "Not so clearly", "Not at all clearly"]
	},
	{
		title: "How quickly did your recruiter reply to your e-mails?",
		options: ["Extremely quickly", "Very quickly", "Somewhat quickly", "Not so quickly", "Not at all quickly"]
	},
	{
		title: "How quickly did your recruiter return your phone calls?",
		options: ["Extremely quickly", "Very quickly", "Somewhat quickly", "Not so quickly", "Not at all quickly"]
	},
	{
		title: "Overall, were you satisfied or dissatisfied with the recruiting process at our company?",
		options: ["Very satisfied", "Satisfied", "Neither satisfied nor dissatisfied", "Dissatisfied", "Very dissatisfied"]
	},
	{
		title: "How did you learn about the job opening at our company?",
		options: []
	},
	{
		title: "What can we do to improve the recruiting process at our company?",
		options: []
	},
	{
		title: "How likely is it that you will recommend your recruiter to a friend or colleague?",
		options: ["Extremely likely", "Very likely", "Somewhat likely", "Not so likely", "Not likely at all"]
	}
]}).insertedId;

var survey2 = db.surveys.insertOne({created_by: user1, timestamp: new Date(), title: "Product feedback", questions: [
	{
		title: "What is your first reaction to our product?",
		options: ["Very positive", "Somewhat positive", "Netural", "Somewhat negative", "Very negative"]
	},
	{
		title: "How would you rate the quality of our product?",
		options: ["Very high quality", "High quality", "Neither high nor low quality", "Low quality", "Very low quality"]
	},
	{
		title: "In your own words, what are the things that you like most about this new product?",
		options: []
	},
	{
		title: "In your own words, what are the things that you would most like to improve in this new product?",
		options: []
	}
]}).insertedId;

var survey3 = db.surveys.insertOne({created_by: user1, timestamp: new Date(), title: "Customer service", questions: [
	{
		title: "Overall, how would you rate the quality of your customer service experience?",
		options: ["Very positive", "Somewhat positive", "Neutral", "Somewhat negative", "Very negative"]
	},
	{
		title: "How well did we understand your questions and concerns?",
		options: ["Extremely well", "Very well", "Somewhat well", "Not so well", "Not at all well"]
	},
	{
		title: "How much time did it take us to address your questions and concerns?",
		options: ["Much shorter than expected", "Shorter than expected", "About what I expected", "Longer than expected", "Much longer than expected"]
	},
	{
		title: "How likely is it that you would recommend this company to a friend or colleague?",
		options: ["Extremely likely", "Very likely", "Somewhat likely", "Not so likely", "Not at all likely"]
	},
	{
		title: "Do you have any other comments, questions or concerns?",
		options: []
	}
]}).insertedId;

var survey4 = db.surveys.insertOne({created_by: user1, timestamp: new Date(), title: "Website feedback", questions: [
	{
		title: "Overall, how well does our website meet your needs?",
		options: ["Extremely well", "Very well", "Somewhat well", "Not so well", "Not at all well"]
	},
	{
		title: "How easy was it to find what you were looking for on our website?",
		options: ["Extremely easy", "Very easy", "Somewhat easy", "Not so easy", "Not at all easy"]
	},
	{
		title: "Do you have any comments on how we can improve our website?",
		options: []
	}
]}).insertedId;

var survey5 = db.surveys.insertOne({created_by: user2, timestamp: new Date(), title: "Event planning", questions: [
	{
		title: "Will you be attending the event?",
		options: ["Yes", "No"]
	},
	{
		title: "If you will not be attending the event, please explain why.",
		options: []
	},
	{
		title: "How did you hear about this event?",
		options: []
	},
	{
		title: "Do you have any dietary restrictions?",
		options: []
	},
	{
		title: "What topics would you most like to learn about or discuss at this event?",
		options: []
	},
	{
		title: "Are there any questions you would like to be addressed at this event?",
		options: []
	}
]}).insertedId;

db.createCollection("responses")

db.responses.insertOne({survey: survey1, made_by: user2, timestamp: new Date(), contents: [
	"Extremely professional",
	"Extremely knowledgeable",
	"Extremely clearly",
	"Much too much",
	"Extremely clearly",
	"Extremely quickly",
	"Extremely quickly",
	"Very satisfied",
	"On the internet",
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus risus ipsum, bibendum sit amet leo vitae, vehicula hendrerit tellus. Phasellus volutpat, dui ut rutrum eleifend, mi metus consectetur odio, ac vehicula est velit ut urna. Phasellus id sapien et nulla imperdiet eleifend. Ut suscipit nunc ac condimentum rutrum. Suspendisse dapibus, nisl sed eleifend viverra, est metus dictum mauris, eget feugiat urna turpis eu ligula. Proin vel tellus ullamcorper, vehicula urna et, tincidunt lacus. Sed id urna tellus. Proin efficitur augue tellus, sed hendrerit neque molestie a. Fusce a consectetur lectus.",
	"Extremely likely"
]});

db.responses.insertOne({survey: survey1, made_by: user3, timestamp: new Date(), contents: [
	"Not at all professional",
	"Not at all knowledgeable",
	"Not at all clearly",
	"Much too little",
	"Not at all clearly",
	"Not at all quickly",
	"Not at all quickly",
	"Very dissatisfied",
	"",
	"",
	"Not at all likely"
]});

db.responses.insertOne({survey: survey2, made_by: user4, timestamp: new Date(), contents: [
	"Very positive",
	"Very high quality",
	"Anything",
	""
]});
