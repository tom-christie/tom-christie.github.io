library(ggplot2)
require(base)
#subject_id = '3337264'
subject_id = "Nate!"
figure_directory = 'figures/'
mydata = read.csv(paste(subject_id,'_formatted.csv',sep=""), header=TRUE)
#change column names
colnames(mydata) <- c("trial_number","prob_same","response_number","time_taken",
                      "response_was_S","response_was_correct","target_response_switched","target_response_was_S")
attach(mydata)


#extend mydata frame with regressors
if(1){
    #CATEGORICAL
    actual_response_switched <- response_was_S[-1] != response_was_S[-length(response_was_S)]
    actual_response_switched[actual_response_switched==FALSE] = 0 #convert to binary
    actual_response_switched = c(0,actual_response_switched)
    mydata <- cbind(mydata,actual_response_switched)
    
    #info based on previous responses and feedback
    #make empty arrays
    mydata_length = length(row(mydata)[,1])
    previous_actual_response_was_switch = rep(0,mydata_length)
    previous_target_response_was_switch = rep(0,mydata_length)
    previous_response_was_error = rep(0,mydata_length)
    for(r in row(mydata)[-1,1]){
        #if the previous answer is from the same trial
        if(mydata$response_number[r] != 1){
            #previous_response_was_switch
            if(mydata$actual_response_switched[r-1] == 1){
                previous_actual_response_was_switch[r] = 1
            }
            if(mydata$target_response_switched[r-1] == 1){
                previous_target_response_was_switch[r] = 1
            }
            #previous_response_was_error - i.e. positive and negative feedback
            if(mydata$response_was_correct[r-1] == 0){
                previous_response_was_error[r] = 1
            }      
        }else{
            previous_actual_response_was_switch[r] = NA
            previous_target_response_was_switch[r] = NA
            previous_response_was_error[r] = NA
        }
    }
    
    #concatenate columns of categorical data data frame
    mydata <- cbind(mydata,previous_actual_response_was_switch)
    mydata <- cbind(mydata,previous_target_response_was_switch)
    mydata <- cbind(mydata,previous_response_was_error)
    
    #CONTINUOUS
    #number of preceeding in a row that are the same (number of S's in a row preceeding)
    #make a cumulative sum for target_S and actual_S binary variables
    number_of_same_preceeding  = rep(0,mydata_length)
    number_of_different_preceeding  = rep(0,mydata_length)        
    counter_same = 0
    counter_different = 0
    row = 1
    for(i in mydata$target_response_was_S){
        #print(paste(i,counter_same,counter_different))
        if(i==1){ #response was same
            counter_same = counter_same + 1
            counter_different = 0
            if(counter_same > 1){
                #same condition
                number_of_same_preceeding[row] = number_of_same_preceeding[row-1] + 1 
            }else{                
                number_of_same_preceeding[row] = 0   
            }
        }
        else{
            counter_different = counter_different + 1
            counter_same = 0
            if(counter_different > 1){
                number_of_different_preceeding[row] = number_of_different_preceeding[row-1] + 1
            }else{
                number_of_different_preceeding[row] = 0
            } 
        } 
        row = row + 1
    }
    
    mydata <- cbind(mydata,number_of_same_preceeding)
    mydata <- cbind(mydata,number_of_different_preceeding)
    
    #     #take out info that isn't useful for us
    #     omit <- c("response_num","target_response","response_switch_target","actual_response","response_correct","response_switch_actual","blood.sugar")
    #     mydata_subset <- mydata[,!(names(mydata) %in% omit)]
    write.csv(mydata, paste(subject_id,'_complete.csv',sep=""))
    
}#end mydata frame extension



#plotting
if(1){
    
    #response time histogram for each
    ggplot(mydata[mydata$time_taken < 1500, ], aes(time_taken,fill=factor(prob_same))) + 
        geom_histogram(alpha = 0.5, aes(y = ..density..), position = 'identity', binwidth=50) + #position='identity' makes each plot separately and overlap
        ggtitle(paste("response times"))  + 
        xlim(0, 1600)  + 
        ylim(0, .01) + labs(x="time taken (ms)", fill="Prob same")# + facet_wrap( ~ prob_same, ncol = 2)
    ggsave(file= paste(figure_directory,'response times histograms_',subject_id,'.png',sep=""),  width=12, height=8)
    
    #response time boxplot
    qplot(factor(prob_same),time_taken,data=mydata[mydata$time_taken < 1500, ],geom="boxplot", fill=factor(prob_same))
    ggsave(file= paste(figure_directory,'response times boxplots_',subject_id,'.png',sep=""),  width=12, height=8)
    
    
    
    #response times for each blood sugar level as a function of same/switch
    ggplot(data = mydata[mydata$time_taken < 1500, ], aes(time_taken)) + 
        geom_histogram(alpha = 0.5, aes(y = ..density..), position = 'identity', binwidth=50) +
        ggtitle(paste("response times as a target key switch or stay"))  + 
        xlim(0, 1800)  + 
        ylim(0, .01) + facet_grid(prob_same ~ target_response_switched)
    ggsave(file= paste(figure_directory,'same vs different response times_',subject_id,'.png',sep=""), width=12, height=8)
    
    qplot(factor(target_response_switched),time_taken,
          data=mydata[mydata$time_taken < 1500, ],
          geom="boxplot", 
          fill=factor(prob_same), 
          facet = (factor(prob_same)~.)
    )
    ggsave(file= paste(figure_directory,'response times based on target switch_',subject_id,'.png',sep=""),  width=12, height=8)
    
    
    
    #probability correct time-locked to TARGET switch trials
    lag_mydata_target = data.frame()
    num_lags = 3
    all_trials = union(mydata$trial_number,mydata$trial_number)
    for(trial in all_trials){
        x <- mydata[mydata$trial_number == trial, ] #get subset of mydata
        for(response in x$response_number[c((num_lags*2):(length(x$response_number)-num_lags))]){
            if(x[x$response_number == response,]$target_response_switched == 1){
                #print(response)
                temp <- x[x$response_number >= response-num_lags  &  x$response_number <= response+num_lags, ]
                #print(temp)
                temp$lagnum = (-1*num_lags):num_lags     
                lag_mydata_target <- rbind(lag_mydata_target,temp)
            }
        }
    }
    #proportion incorrect as a function of lag  from TARGET switches
    temp = ddply(lag_mydata_target,c("prob_same","lagnum"),function(x) {    
        counts = count(x$response_was_correct,1)
        data.frame(proportion.error = (1 - counts$freq[counts$x==1] / sum(counts$freq)))
    })
    ggplot(temp, aes(x = factor(lagnum), y = proportion.error)) +
        geom_bar(stat = "identity", aes(fill=factor(lagnum))) + 
        facet_grid( . ~ prob_same) + 
        labs(main="Proportion Error, where Lag=0 is key switch switch trial")
    ggsave(file= paste(figure_directory,'proportion errors by lag of TARGET switch trials and prob_same_',subject_id,'.png',sep=""),  width=12, height=8)
    
    
    #probability correct time-locked to ACTUAL switch trials
    lag_mydata_actual = data.frame()
    num_lags = 3
    all_trials = union(mydata$trial_number,mydata$trial_number)
    for(trial in all_trials){
        x <- mydata[mydata$trial_number == trial, ] #get subset of mydata
        for(response in x$response_number[c((num_lags*2):(length(x$response_number)-num_lags))]){
            if(x[x$response_number == response,]$actual_response_switched == 1){
                #print(response)
                temp <- x[x$response_number >= response-num_lags  &  x$response_number <= response+num_lags, ]
                #print(temp)
                temp$lagnum = (-1*num_lags):num_lags     
                lag_mydata_actual <- rbind(lag_mydata_actual,temp)
            }
        }
    }
    #proportion incorrect as a function of lag  from TARGET switches
    temp = ddply(lag_mydata_actual,c("prob_same","lagnum"),function(x) {    
        counts = count(x$response_was_correct,1)
        
        data.frame(proportion.error = (1 - counts$freq[counts$x==1] / sum(counts$freq)))
    })
    ggplot(temp, aes(x = factor(lagnum), y = proportion.error)) +
        geom_bar(stat = "identity", aes(fill=factor(lagnum))) + 
        facet_grid( . ~ prob_same) + 
        labs(main="Proportion Error, where Lag=0 is key switch switch trial")
    ggsave(file= paste(figure_directory,'proportion errors by lag of ACTUAL switches and prob_same_',subject_id,'.png',sep=""),  width=12, height=8)
    
    #same thing but mean response time
    #TARGET was switch
    temp = ddply(lag_mydata_target,c("prob_same","lagnum"),function(x) {  
        errorbar = 1.96 * sd(x$time_taken)/sqrt(length(x$time_taken))
        data.frame(mean.response.time = mean(x$time_taken), errorbar=errorbar)
    })
    ggplot(temp, aes(x = factor(lagnum), y = mean.response.time)) +
        geom_bar(stat = "identity", aes(fill=factor(lagnum))) + 
        geom_errorbar(aes(ymax=mean.response.time+errorbar, ymin=mean.response.time-errorbar), width=.1) + 
        facet_grid( . ~ prob_same) + 
        labs(main="Response time, where Lag=0 is key switch switch trial")
    ggsave(file= paste(figure_directory,'response time by lag of TARGET switch trials and prob_same_',subject_id,'.png',sep=""),  width=12, height=8)
    
    #ACTUAL was switch
    temp = ddply(lag_mydata_actual,c("prob_same","lagnum"),function(x) {   
        errorbar = 1.96 * sd(x$time_taken)/sqrt(length(x$time_taken))
        data.frame(mean.response.time = mean(x$time_taken), errorbar=errorbar)
    })
    ggplot(temp, aes(x = factor(lagnum), y = mean.response.time)) +
        geom_bar(stat = "identity", aes(fill=factor(lagnum))) + 
        geom_errorbar(aes(ymax=mean.response.time+errorbar, ymin=mean.response.time-errorbar), width=.1) + 
        facet_grid( . ~ prob_same) + 
        labs(main="Response time, where Lag=0 is key switch switch trial")
    ggsave(file= paste(figure_directory,'response time by lag of ACTUAL switch trials and prob_same_',subject_id,'.png',sep=""),  width=12, height=8)
    
    
    
    
    #todo - speed/accuracy tradeoff for each trial, colored by prob_same
    temp = ddply(mydata,c("prob_same","trial_number"),function(x) {    
        speed = 1/mean(x$time_taken)
        counts = count(x$response_was_correct,1)
        data.frame(speed=speed, accuracy = counts$freq[counts$x==1] / sum(counts$freq))
    })
    ggplot(temp, aes(x = speed, y = accuracy, color=factor(prob_same))) +
        stat_smooth(method=lm, alpha=.1, fullrange = TRUE) + 
        geom_point() + 
        labs(main="Speech/accuracy tradeoff on each trial")
    ggsave(file= paste(figure_directory,'speed vs accuracy for each prob_same_',subject_id,'.png',sep=""),  width=12, height=8)
    

    #density of speed as a function of prob_same over ALL trials (split only by prob_same)
    ggplot(mydata[mydata$time_taken < 5000 & mydata$time_taken > 200, ], aes(x = 1/time_taken, color=factor(prob_same))) +
        geom_density(aes(fill=factor(prob_same), alpha=.5)) + 
        labs(main="Speech/accuracy tradeoff on each trial", x="speed")
    ggsave(file= paste(figure_directory,'speed density for each prob_same_',subject_id,'.png',sep=""),  width=12, height=8)
    
    
    
    
    
}#end plotting   

