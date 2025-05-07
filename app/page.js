import './page.css';

export default function Home() {
  return (
    <div>
      <div
        className="text-center w-full relative"
        style={{ height: "90vh", maxHeight: "700px", position: "relative", overflow: "hidden" }}
      >
        <video autoPlay muted loop className="video-background">
          <source
            src="https://video.wixstatic.com/video/11062b_9de2dbff3dda403b944bb98c41cb5764/1080p/mp4/file.mp4"
            type="video/mp4"
          />
        </video>
        <div className="text-center px-3 pt-20" style={{ position: "relative", zIndex: 2 }}>
          <div className="font-sans font-bold uppercase tracking-widest">
            Your new partner in 
          </div>
          <div className="font-lulo text-3xl sm:text-5xl md:text-7xl pt-3">
            Success
          </div>
          <div className="text-lg pt-4 tracking-wider">
            Circuit-Based Approach to Mental Transformation
          </div>
        </div>
        
        <div className="w-full text-center absolute bottom-5" style={{ zIndex: 2 }}>
          <a
            className="btn-main"
            href="https://calendly.com/abeapple/free-consultation"
          >
            Claim Your Free Consultation
          </a>
        </div>
      </div>

      <div className="">
        {/* What We Do section */}
        <div id="what-we-do" className="w-full bg-white h-full relative py-8">
          <div className="max-w-full-content mx-auto h-full px-5">            
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-green-600 font-cursive text-3xl mb-5">What We Do</p>
              
              <div className="text-sm leading-7 space-y-5">
                <p>
                  We use technical results based approaches to make people into who they want to be. Most people feel that they are not able to fully express themselves and live the life they dream of. They know the potential is inside of them, there's just something in the way. We address the things that people would like to change but have never had the opportunity to address. Anything from improving memory or leadership ability, to reducing anxiety or depression, to building self esteem and a winners mindset, to overcoming addiction. All of these things are just patterns in our mind and all of them can be adjusted.
                </p>
              </div>
            </div>
          </div>
        </div>
            
        {/* Focus Areas Section - Updated with parallax background */}
        <div id="focus-areas" className="parallax-background">
          <div className="max-w-full-content mx-auto bg-transparent p-5">
            <h2 className="text-center font-bold text-2xl pb-5">
              Focus Areas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto bg-white/80 p-6 rounded-lg">
              {/* Focus area checkboxes */}
              {[
                'Anxiety', 
                'Depression', 
                'Winners Mindset', 
                'Memory Enhancement', 
                'Conflict Resolution', 
                'Self Esteem Building', 
                'Coping Skills', 
                'Mood Enhancement',
                'Trauma',
                'Childhood Neglect',
                'Eating Disorders',
                'BPD',
              ].map((area, index) => (
                <div key={index} className="flex items-center space-x-2 p-2">
                  <div className="w-5 h-5 border-2 border-black flex-shrink-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-black"></div>
                  </div>
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
            
            <div className="flex my-8 justify-center">
              <a className="btn-main" href="https://calendly.com/abeapple/30min">
                Free Assessment
              </a>
            </div>
          </div>
        </div>

        {/* Methods Section (combining Our Methods and EMD) */}
        <div className="w-full bg-gray-50 h-full relative py-16">
          <div className="max-w-full-content mx-auto h-full px-5">            
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">Our Methods</h2>
              <div className="header-line my-4 mx-auto"></div>
              <div className="text-sm leading-7 space-y-6">
                <p>
                  Often people will feel a general sense of anxiety or sadness, or they will be following a behavioral pattern they don't like, but they won't know exactly why or how to change. The reason for this is that most people have memories of moments that made them feel a lot of emotions that they never fully processed, and although they may not be consciously thinking of them these memories are still being processed right below the surface of conscious awareness and affecting their mood and day to day life.
                </p>
                <p className="text-green-600 font-cursive text-3xl mb-8">What is EMD</p>
                <p>
                  EMD or Emotional Memory Discharge is a teqnique used to find these memories and remove the emotion so the patient can find relief. This is not something that can be done alone. The facilitator uses a specific process to guide the patient until they find the key moments in their past and then guides them to release the emotion and process the memory. This tequnique creates rapid and lasting results even in cases that are otherwise very hard to treat.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Circuit Based Approach Section */}
        <div id="circuit-based-approach" className="w-full bg-white h-full relative py-16">
          <div className="max-w-full-content mx-auto h-full px-5">            
            <div className="text-center max-w-4xl mx-auto">
              <p className="text-green-600 font-cursive text-3xl mb-8">
                What is a "Circuit based" approach?
              </p>
              
              <div className="text-sm leading-7 space-y-6">
                <p>
                  Viewing the brain as a system of interconnected circuits allows to identify and correct the root of many disfunctions that are otherwise hard to make meaning progress on. Specific process can be created to solve specific issues with a high level of consistency and accuracy. To demonstrate this here are a few examples:
                </p>
                
                <div className="mt-10 mb-10">
                  <h3 className="text-xl font-bold mb-4 text-center">BPD (Borderline Personality Disorder)</h3>
                  <p className="mb-4">
                    A common reaction to high stress or abandonment early in life is for the part of the brain related to anxious responses (called the amygdala) to become over active while the parts of the brain related to episodic memory and planning/focus (called the hippocampus and PFC or prefrontal cortex) become less active. This results in general anxiety especially related to social situations along with a hazy sense of self and can sometimes cause impulsive actions when feeling anxious.
                  </p>
                  <p className="mb-4">
                    For example someone who is on this spectrum may be anxious when sending a text message or if they don't get a response feeling like the other person will judge them and not like them anymore, like they may be abandoned, and so they will have the impulse to double text to make sure the other person still likes them. This happens because their amygdala is triggered very easily, their hippocampus doesn't remember all of the times this happened before and was ok, and their PFC (which would normally show down and make a plan) is overpowered by the amygdala so they act impulsively to double text to calm the feeling of anxiety, or they just continue feel anxious.
                  </p>
                  <p>
                    The solution to this is specialized guided exercises that strengthen the hippocampus by rerunning episodic memories (memories about ones self) that improve self image and self esteem. Once that circuit is strengthened times where the patient was anxious at first but everything turned out to be ok are used to connect the hippocampus to the amygdala using the hippocampus's recall ability to naturally keep the amygdala calm. Once these things are in place we can find the emotionally charged memories that led to the cognitive dysbiosis and remove the emotion so the memories no longer effect the patient. Studies that utilize MRI brain imaging have shown significant structural changes in the sizes of these brain regions corresponding with significant patient relief. This holistic approach gets to the root of the issue and solves it instead of just putting a band-aid over it.
                  </p>
                </div>
                
                <div className="mt-10 mb-6">
                  <h3 className="text-xl font-bold mb-4 text-center">Winner Mindset Reprogramming</h3>
                  <p className="mb-4">
                    Many people struggle with self-doubt and negative thought patterns that prevent them from achieving their full potential. These patterns often develop from past experiences of failure or criticism, creating neural pathways that automatically trigger feelings of inadequacy when faced with challenges.
                  </p>
                  <p className="mb-4">
                    Be in the character of a winner by going back to all of the times you won, walking through it, feeling those feelings again, realizing why you won, and strengthening that pattern so you win more. Reliving your best moments not only lifts your mood and boosts your self esteem, it makes it more likely that you will follow these same patterns more in the future.
                  </p>
                  <p>
                    Through targeted exercises that activate and strengthen the neural circuits associated with success and confidence, we can literally rewire the brain to default to a winner's mindset. This process involves identifying past successes, no matter how small, and systematically reinforcing the positive emotions and thought patterns associated with those experiences. Over time, these strengthened circuits become the dominant response pattern, replacing self-doubt with self-assurance and hesitation with decisive action. This is not merely positive thinking—it's a structural change in how your brain processes challenges and opportunities.
                  </p>
                </div>

                <div className="mt-10 mb-6">
                  <h3 className="text-xl font-bold mb-4 text-center">Memory Circuit Building</h3>
                  <p className="text-sm leading-7">
                    There are people who can memorize the order of a deck of cards or the names of 100 people with perfect accuracy after seeing them only once. These people are not born this way they learn these skills through specialized practices. These practices strengthen the specific brain circuits and regions that give us these abilities so anyone can achieve this level of recall. Imagine being able to remember all of the information that you hear or read. You would always get high marks on tests without ever needing to study.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        {/* Services section with rectangles */}
        <div id="our-services" className="parallax-background">
          <div
            className="max-w-full-content mx-auto bg-transparent p-5"
          >
            <h2 className="text-center font-bold text-2xl pb-5">
              Our Services
            </h2>

            <div className="mx-auto flex flex-wrap my-3 m-auto grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {/* Free Consultation */}
              <div className="w-full rounded-none overflow-hidden mx-auto border-8 border-black relative h-full min-h-[300px]">
                <div className="p-6 pb-20 text-center h-full">
                  <a
                    href="https://calendly.com/abeapple/free-consultation"
                    className="font-bold text-xl hover:text-gray-700"
                  >
                    Free Consultation
                  </a>
                  <p className="text-sm mt-2">Discover how we can help you</p>
                  <div className="border-top border border-black w-full my-6"></div>
                  <p className="text-gray-700 text-base">$0</p>
                  <p className="text-gray-700 text-base">60 min</p>
                </div>
                <div className="w-full mx-auto pb-8 absolute bottom-0 text-center">
                  <a href="/calendar/free-consultation" className="btn-main">
                    Book Now
                  </a>
                </div>
              </div>

              {/* Individual Session */}
              <div className="w-full rounded-none overflow-hidden mx-auto border-8 border-black relative h-full min-h-[300px]">
                <div className="p-6 pb-20 text-center h-full">
                  <a
                    href="/service/individual-session"
                    className="font-bold text-xl hover:text-gray-700"
                  >
                    Individual Session
                  </a>
                  <p className="text-sm mt-2">One-on-one coaching sessions</p>
                  <div className="border-top border border-black w-full my-6"></div>
                  <p className="text-gray-700 text-base">$0 - $25 - $200</p>
                  <p className="text-gray-700 text-base">60-90 min</p>
                </div>
                <div className="w-full mx-auto pb-8 absolute bottom-0 text-center">
                  <a 
                    href={"https://calendly.com/abeapple/one-on-one-session"} 
                    className="btn-main">
                    Book Now
                  </a>
                </div>
              </div>

              {/* Group Session */}
              <div className="w-full rounded-none overflow-hidden mx-auto border-8 border-black relative h-full min-h-[300px]">
                <div className="p-6 pb-20 text-center h-full">
                  <a
                    href="https://calendly.com/abeapple/group-session"
                    className="font-bold text-xl hover:text-gray-700"
                  >
                    Group Session
                  </a>
                  <p className="text-sm mt-2">Small group coaching sessions</p>
                  <div className="border-top border border-black w-full my-6"></div>
                  <p className="text-gray-700 text-base">$0 - $25 - 200</p>
                  <p className="text-gray-700 text-base">90 min</p>
                </div>
                <div className="w-full mx-auto pb-8 absolute bottom-0 text-center">
                  <a href="/calendar/group-session" className="btn-main">
                    Book Now
                  </a>
                </div>
              </div>

              {/* Assessment */}
              <div className="w-full rounded-none overflow-hidden mx-auto border-8 border-black relative h-full min-h-[300px]">
                <div className="p-6 pb-20 text-center h-full">
                  <a
                    href="/service/free-consultation"
                    className="font-bold text-xl hover:text-gray-700"
                  >
                    Assessment
                  </a>
                  <p className="text-sm mt-2">Discover yourself</p>
                  <div className="border-top border border-black w-full my-6"></div>
                  <p className="text-gray-700 text-base">$0</p>
                  <p className="text-gray-700 text-base">30 min</p>
                </div>
                <div className="w-full mx-auto pb-8 absolute bottom-0 text-center">
                  <a 
                    href="https://calendly.com/abeapple/30min" 
                    className="btn-main"
                  >
                    Book Now
                  </a>
                </div>
              </div>

            </div>

            {/* <div className="flex my-8 justify-center">
              <a className="btn-main" href="/book-now">
                More Services
              </a>
            </div> */}
          </div>
        </div>


        {/* Three-column grid section */}
        <div id="contact" className="w-full bg-gray-50 h-full relative py-2.5">
          <div className="max-w-full-content mx-auto h-full px-8 md:px-12">
            <div className="text-center mb-12">
              <div className="header-line mb-6 mx-auto"></div>
              <h2 className="mb-7 tracking-tighter title text-3xl md:text-4xl font-bold">Our Process</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {/* First Section */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Assessment</h3>
                <p className="text-sm leading-7">
                  We begin with a comprehensive assessment to identify the specific circuits in your brain that need strengthening. 
                  This personalized approach ensures that we target the exact areas that will give you the results you want.
                </p>
              </div>
              
              {/* Second Section */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Targeted Intervention</h3>
                <p className="text-sm leading-7">
                  Using specialized techniques like EMD (Emotional Memory Discharge), we help you process unresolved emotions 
                  and strengthen positive neural pathways. This creates lasting changes in how your brain functions.
                </p>
              </div>
              
              {/* Third Section */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Transformation</h3>
                <p className="text-sm leading-7">
                  As your brain circuits strengthen, you'll experience remarkable improvements in memory, mood, self-esteem, 
                  and other areas. These changes aren't just temporary fixes—they represent fundamental shifts in how your brain operates.
                </p>
              </div>
            </div>
            
            {/* <div className="text-center mt-12">
              <a href="/about-me" className="btn-main">
                Learn More
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
