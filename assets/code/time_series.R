#cor is r, not r^2
#cor is sum(Dx * Dy) / sqrt((sum(Dx*Dx) * sum(Dy*Dy))), where Dx = (x-mean(x))
#this is the SAMPLE correlation coefficne
#rho is population, r is sample


#make text more readable
theme_update(
    axis.text.x = element_text(size=14),
    axis.text.y = element_text(size=14),
    axis.title.x = element_text(size=14),
    axis.title.y = element_text(size=14),
    legend.text = element_text(size=14),
    legend.title = element_text(size=14),
    strip.text.x = element_text(size=14),
    strip.text.y = element_text(size=14)
)


N = 1000
covariance = matrix(c(1, .8, .8, 1), nrow=2, ncol=2)
data = mvrnorm(N, c(0,0), covariance)
data = as.data.frame(data)
colnames(data) = c('x','y')
data$time <- factor(c(rep(1,N/5),rep(2,N/5), rep(3,N/5), rep(4,N/5), rep(5,N/5)))
data$order <- seq(1,N)

#two time-series
ggplot(data, aes(order)) + 
    geom_line(aes(y = x, color = 'x'), alpha=.8) + 
    geom_line(aes(y = y, colour = "y"), alpha=.8) + 
    labs(color = "Variable", x = "Time / Order", y = "value") 


#scatter plot
model <- lm(y~x,data)
coef <- coef(model)
qplot(x,y,data=data)
qplot(x,y,data=data,color=factor(time)) + labs(color="Time") + 
    geom_abline(intercept=coef[1],
                slope=coef[2])

data_discretized <- discretize(data,disc="equalwidth",nbins=30)

data_discretized$time[data_discretized$time == 8] = 2
data_discretized$time[data_discretized$time == 16] = 3
data_discretized$time[data_discretized$time == 23] = 4
data_discretized$time[data_discretized$time == 30] = 5
data_melted <- melt(data_discretized, id.vars = c(3,4))

#separated by x,y
qplot(value, 
      data=data_melted, 
      geom="bar", 
      #fill=factor(time),
      facets= . ~ variable,
      xlab="data value") + labs(fill="Time")


#separate by time, overlapping
#separate by time, overlapping
data_melted_continuous <- melt(data, id.vars = c(3,4))
ggplot(data_melted_continuous, aes(value,fill=time)) + 
    geom_histogram(alpha = 0.5, aes(y = ..density..), position = 'identity') + 
    facet_grid(variable ~ .)

#autocorrelated data
N = 1000
#make fake correlated data
rsquared = 0
y.normal = 0
x.normal = 0
while(x.normal < .0001 ){
    x <- cumsum(rnorm(N))
    x.normal <- shapiro.test(x)$p.value
    counter = 0
}
plot(x)

while(rsquared < .8 || y.normal < .00001){

    rsquared = 0
    y.normal = 0
    
    while(rsquared < .8){
        y <- cumsum(rnorm(N))
        #get r-squared value
        rsquared <- cor(x,y)
        #print(rsquared)
    }
    y.normal <- shapiro.test(y)$p.value
    print(c(rsquared, x.normal, y.normal))

}

fake_data <- as.data.frame(cbind(x,y))
colnames(fake_data) = c("x","y")
save(fake_data, file = 'correlatedSeries.RData')
fake_data$time <- factor(c(rep(1,N/5),rep(2,N/5), rep(3,N/5), rep(4,N/5), rep(5,N/5)))
fake_data$order <- seq(1,N)

#two time-series
ggplot(fake_data, aes(order)) + 
    geom_line(aes(y = x, colour = "x")) + 
    geom_line(aes(y = y, colour = "y")) + 
    labs(color = "Variable", x = "Time / Order", y = "value")


#scatter
qplot(x,y,data=fake_data,color=time,geom="jitter") + labs(color="Time")

fake_data_discretized <- discretize(fake_data,disc="equalwidth",nbins=30)
fake_data_melted <- melt(fake_data_discretized, id.vars = c(3,4))

#separated by x,y
qplot(value, 
      data=fake_data_melted, 
      geom="bar", 
      #fill=factor(time),
      facets= . ~ variable,
      xlab="data value") + labs(fill="Time")

# #separate by time
# qplot(value, data=fake_data_melted, 
#       geom="bar", 
#       fill=factor(time),
#       facets=variable ~ time,
#       xlab="data value")

#separate by time, overlapping
fake_data_melted_continuous <- melt(fake_data, id.vars = c(3,4))
ggplot(fake_data_melted_continuous, aes(value,fill=time)) + 
    geom_histogram(alpha = 0.5, aes(y = ..density..), position = 'identity') + 
    facet_grid(variable ~ .) +
    opts(axis.title.x = theme_text(size = 20))

#do differencing
fake_data$x_diff <- c(0,diff(fake_data$x)) #have to append one value
fake_data$y_diff <- c(0,diff(fake_data$y))

#two time-series
ggplot(fake_data, aes(order)) + 
    geom_line(aes(y = x_diff, colour = "x")) + 
    geom_line(aes(y = y_diff, colour = "y")) + 
    labs(color = "Variable", x = "Time / Order", y = "value")


acf(data$x,.ag.max=100,main="ACF of correlated data")
acf(fake_data$x,lag.max=100, main="ACF of time series data")
acf(fake_data$x_diff,lag.max=100, main="ACF of differenced time series data")
#scatter of differenced data
qplot(x_diff,y_diff,data=fake_data)
qplot(x_diff,y_diff,data=fake_data,color=factor(time)) + labs(color="Time")



#linear fits
plot.y <- qplot(x,y,color=time,data=data)
model.y <- lm(y~x, data)
coef.y <- coef(model.y)
plot.y + geom_abline(intercept=coef.y[1],
                     slope=coef.y[2])
#residuals
data$residuals <- resid(model.y)
plot.residuals <- qplot(x,residuals,color=time,data=data) + labs(y = "residual")
plot.residuals + geom_abline(intercept=0,slope=0)


plot.y <- qplot(x,y,color=time,data=fake_data)
model.y <- lm(y~x, fake_data)
coef.y <- coef(model.y)
plot.y + geom_abline(intercept=coef.y[1],
                     slope=coef.y[2])
#residuals
fake_data$residuals <- resid(model.y)
plot.residuals <- qplot(x,residuals,color=time,data=fake_data) + labs(y = "residual")
plot.residuals + geom_abline(intercept=0,slope=0)


ccs_correlated = vector()
for(i in seq(1,5)){
    ccs_correlated[i] =cor(data$x[seq(1+(i-1)*200,i*200)],data$y[seq(1+(i-1)*200,i*200)])^2
}
ccs_correlated_df <- as.data.frame(cbind(seq(1,5), ccs_correlated))
colnames(ccs_correlated_df) = c("time","correlation")
ggplot(data=ccs_correlated_df, aes(x=time, y=correlation, fill=factor(time))) + 
    geom_bar(stat="identity") + 
    geom_abline(intercept=cor(data$x,data$y)^2,
                slope=0) + 
    ylim(0,1) + labs(fill = "Time",title="Correlation in sub-groups of the correlated data")



ccs_fake = vector()
for(i in seq(1,5)){
    ccs_fake[i] =cor(fake_data$x[seq(1+(i-1)*200,i*200)],fake_data$y[seq(1+(i-1)*200,i*200)])^2 
}
ccs_fake_df <- as.data.frame(cbind(seq(1,5), ccs_fake))
colnames(ccs_fake_df) = c("time","correlation")
ggplot(data=ccs_fake_df, aes(x=time, y=correlation, fill=factor(time))) + 
    geom_bar(stat="identity") + 
    geom_abline(intercept=cor(fake_data$x,fake_data$y)^2,
                slope=0) + 
    ylim(0,1) + labs(fill = "Time",title="Correlation in sub-groups of the time series data", time="Time")



ccs_fake_diff = vector()
for(i in seq(1,5)){
    ccs_fake_diff[i] =cor(fake_data$x_diff[seq(1+(i-1)*200,i*200)],fake_data$y_diff[seq(1+(i-1)*200,i*200)])^2 
}
ccs_fake_diff_df <- as.data.frame(cbind(seq(1,5), ccs_fake_diff))
colnames(ccs_fake_diff_df) = c("time","correlation")
ggplot(data=ccs_fake_diff_df, aes(x=time, y=correlation, fill=factor(time))) + 
    geom_bar(stat="identity") +
    ylim(0,1) + 
    labs(fill = "Time",title="Correlation in sub-groups of the DIFFERENCED time series data")
    

model <- lm(data$y ~ data$x)

