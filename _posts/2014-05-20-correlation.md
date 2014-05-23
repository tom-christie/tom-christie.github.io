---
layout: post
title: "Spurious correlations: I'm looking at you, internet."
description: "A description goes here."
category: articles
tags: [statistics]
comments: true
share: true
---

Recently there have been [several](http://www.tylervigen.com/) [posts](http://www.reddit.com/r/dataisbeautiful/comments/25txtc/violence_in_the_us_its_all_because_of_hockey_well/) on the interwebs supposedly demonstrating spurious correlations between different things.  A typical image looks like this:

![img](/assets/images/correlation/spurious.png "Spurious correlations")

taken from [here](http://www.tylervigen.com/).

The problem I have with images like this is not the message that one needs to be careful when using statistics (which is true), or that lots of seemingly unrelated things are somewhat correlated with each other (also true).  It's that including the correlation coefficient $$r$$ on the plot is misleading and disingenuous, intentionally or not.

<!-- COMMENT
Statistical tests and metrics require certain assumptions about the data they summarize.  For example, consider the $$ t $$-test everyone learns in high school, used for determining whether the mean of a sample is different from a given number. It works like this:

1. Find a variable of interest $$ x $$.

2. **Assume that $$x$$ is *normally distributed* in the population in question**

3. Take samples from the population (so that we don't have to find and record *every* $$x$$ value).

4. Try to conclude something about the population from the samples. In the case of the $$t$$-test, we're trying to decide whether there's enough evidence to conclude that the population mean is different from some value.

5. Use a statistic derived from the samples to calculate the probability that your conclusion is incorrect.  For the $$t$$-test, we calculate the $$t$$ statistic, consult a table, and find a probability value $$p$$ associated with the statistic. The lower the value, the more confident you can be of your conclusion.  If $$p<0.05$$ you can publish.

The table that takes us from $$t$$ statistic to $$p$$-value in step 5 was created using the assumption (step 2) that the data the $$t$$ statistic summarizes is normally distributed.  If it's not, the $$p$$ value isn't correct, and more importantly, it's misleading.  If this is the case, shouldn't we first [test to see whether $$x$$ is normally distributed](https://en.wikipedia.org/wiki/Normality_test)?  It seems obvious, but in practice most people just eyeball a histogram, shrug (because real data is rarely normally distributed) and use the $$t$$-test anyway. But you can still calculate the $$t$$ value, you can still look up a $$p$$-value in a table, it just doesn't mean what you think it means. Specifically, if $$x$$ isn't normally distributed, $$p$$ doesn't represent a probability of an incorrect conclusion anymore - it's just a meaningless number.
END COMMENT -->


When we calculate statistics that summarize values of a variable (like the mean or standard deviation) or the relationship between two variables (correlation), we're using a *sample* of the data to draw conclusions about the *population*.  In the case of time series, we're using data from a short interval of time to infer what would happen if the time series went on forever.  To be able to do this, your sample must be a good representative of the population, otherwise your sample statistic will not be a good approximation of the population statistic.  For example, if you wanted to know the average height of people in Michigan, but you only collected data from people 10 and younger, the average height of your sample would not be a good estimate of the height of the overall population.  This seems painfully obvious. But this is exactly analogous to what the author of the image above is doing by including the correlation coefficient $r$.  The absurdity of doing this is a little less transparent when we're dealing with time series (values collected over time). This post is an attempt to explain the reasoning using plots rather than math, in the hopes of reaching the widest audience.

## Correlation between two variables

Say we have two variables, $$x$$ and $$y$$, and we want to know if they're related. The first thing we might try is plotting one against the other:

![img](/assets/images/correlation/correlated_scatter.png "Scatter of correlated data")

They look correlated! Computing the correlation coefficient $$r$$ value gives a moderately high value of 0.78.  So far so good.  Now imagine we collected the values of each of $$x$$ and $$y$$ over time, or wrote the values in a table and numbered each row.  If we wanted to, we could tag each value with the order in which it was collected.  I'll call this label "time", not because the data is really a time series, but just so it will be clear how *different* the situation is when the data does represent time series.  Let's look at the same scatter plot with the data color-coded by whether it was collected in the first 20%, second 20%, etc.  This breaks the data into 5 categories:

![img](/assets/images/correlation/correlated_scatter_color.png "Scatter of correlated data, separated by time")

The time a datapoint was collected, or the order in which it was collected, doesn't really seem to tell us much about its value.  We can also look at a histogram of each of the variables:

![img](/assets/images/correlation/correlated_histogram.png "Histogram of correlated data")

The height of each bar indicates the number of points in a particular bin of the histogram. If we separate out each bin column by the proportion of data in it from each time category, we get roughly the same number from each:

![img](/assets/images/correlation/correlated_histogram_color.png "Histogram of correlated data, colored by time")

If plot the histograms of each 20% separately on the same axes, we get histograms that look pretty similar.  Here are the histograms overlapped:

![img](/assets/images/correlation/correlated_histogram_color_overlapping.png "Histogram of correlated data, colored by time, overlapping")

Alright, now let's see what happens is we finally plot the data as time series.

![img](/assets/images/correlation/correlated_time_series.png "Time series of correlated data")

There might be some structure there, but it looks pretty messy. It should look messy, because the original data really had nothing to do with time.  Notice that the data is centered around a given value and has a similar variance at any time point.  If you take any 100-point chunk, you probably couldn't tell me what time it came from.  This, illustrated by the histograms above, means that the data is *independent and identically distributed* (i.i.d. or IID).  That is, at any time point, the data looks like it's coming from the *same* distribution.  That's why the histograms in the plot above almost exactly overlap.  Here's the takeaway:  **correlation is only meaningful when data is i.i.d.**.  I'll explain why below, but keep that in mind for this next section.

## Correlation between two time series

Now let's look at an example of two time series that seem correlated. This is meant to be a direct parallel to the 'suspicious correlation' plots floating around the internet.

I generated some data *randomly*.  $$x$$ and $$y$$ are both a 'normal random walk'.  That is, at each time point, a value is drawn from a normal distribution.  For example, say we draw the value of 1.2.  Then we use that as a starting point, and draw another value from a normal distribution, say 0.3.  Then the starting point for the third value is now 1.5.  If we do this several times, we end up with a time series in which each value is close-ish to the value that came before it.  The important point here is that $$x$$ and $$y$$ were generated by random processes, completely independently from each other.  I just generated a bunch of series until I found some that seemed correlated.

Here's a plot showing the time series of $$x$$ and $$y$$:

![img](/assets/images/correlation/fake_data_time_series.png "Time series of random data")

Hmm!  Looks pretty correlated!  Before we get carried away, we should really make sure that the correlation measure is even relevant for this data.  To do that, make some of the plots we made above with our new data.  With a scatter plot, the data still seems pretty strongly correlated:

![img](/assets/images/correlation/fake_data_scatter.png "Scatter of random data")

Notice something very different in this plot.  Unlike the scatter plot of the data that was *actually* correlated, this data's values are dependent on time. In other words, if you tell me the time a particular data point was collected, I can tell you approximately what its value is. That means that the data is *not* identically distributed (the time series lingo is that these time series are not "stationary").

To make the point a little clearer, let's make a histogram of the data.

![img](/assets/images/correlation/fake_data_histogram.png "Histogram of random data")

Looks pretty good. But now let's again color each bin according to the proportion of data from a particular time interval.

![img](/assets/images/correlation/fake_data_histogram_color.png "Histogram of random data, colored by time.")

Each bin in this histogram does *not* have an equal proportion of data from each time interval.  Plotting the histograms separately reinforces this observation:

![img](/assets/images/correlation/fake_data_histogram_stacked.png "Histograms of random data, colored by time.")

If you take data at different time points, the data is *not* identically distributed.  This means the correlation coefficient $$r$$ is misleading, as it's value is interpreted under the assumption that data is i.i.d.

## Autocorrelation

We've talked about being identically distributed, but what about independent?  Independence of data means that the value of a particular point does not depend on the values recorded before it. Looking at the histograms above, it's clear that this is not the case for the randomly generated time series. If I tell you the value of $$y$$ at a given time is 30, for example, you can be pretty sure that the next value is going to be closer to 30 than 0.

One way to formalize this relationship is by looking at a time series' *autocorrelation*. As the name suggests, it's a way to measure how much a series is correlated with itself.  This is done at different *lags*.  For example, each point in a series can be plotted against each point two points behind it.  For the first (actually correlated) dataset, this gives a plot like the following:

![img](/assets/images/correlation/correlated_lag_2.png "Lag 2 correlation for correlated data")

This means the data is not correlated with itself (that's the "independent" part of i.i.d.).  If we do the same thing with the time series data, we get:

![img](/assets/images/correlation/fake_data_lag_2.png "Lag 2 correlation for random data")

Wow! That's pretty correlated! That means that the time associated with each datapoint tells us a *lot* about the value of that datapoint.  In other words, the data points are *not* independent of each other.

If we plot the autocorrelation function at all lags from the first dataset, we get the following:

![img](/assets/images/correlation/acf_correlated.png "ACF for correlated data")

The value is 1 at lag=0, because each data is obviously correlated with itself.  All the other values are pretty close to 0.  If we look at the autocorrelation of the time series data, we get something very different:

![img](/assets/images/correlation/acf_time_series.png "ACF for time series data")

Again, the height of each bar tells how correlated each time point is, on average, with other points *lag* away.

But why does this matter? Because the $$r$$ value we use to measure correlation is interpretable only when the autocorrelation of each variable is 0 at all lags.

If we want to find the correlation between two time series, we can use some tricks to make the autocorrelation 0.  If we do this, the $$r$$ will be interpretable as the correlation between the time series (explained in the next section).  The easiest method is to just "difference" the data - that is, convert the time series into a new series, where each value is the difference between adjacent values in the nearby series.  If we do this to our time series, the autocorrelation function becomes:

![img](/assets/images/correlation/acf_differenced_time_series.png "ACF for differenced_time series data")

What happens if we plot the *differenced* data against time?  We get:

![img](/assets/images/correlation/differenced_time_series.png "Differenced time series data")

They don't look correlated anymore! How disappointing.  But the data was *not* correlated correlated in the first place: each variable was generated independently of the other. They just looked correlated.  That's the problem.  The apparent correlation was entirely a mirage.  The two variables only looked correlated because they were actually *autocorrelated* in a similar way.  That's exactly what's going on with the spurious correlation plots on the website I mentioned at the beginning.  If we plot the non-autocorrelated versions of these data against each other, we get:

![img](/assets/images/correlation/differenced_scatter.png "Scatter of differenced time series data")

The time no longer tells us about the value of the data.  As a consequence, the data no longer appear correlated. This reveals that the data is actually unrelated.  It's not as fun, but it's the truth.

A criticism of this approach that seems legitimate (but isn't) is that since we're screwing with the data first to make it look random, of  course the result won't be correlated.  However, if you take successive differences between the original non-time-series data, you get a correlation coefficient of $$r=0.78$$, same as we had above!  Differencing destroyed the apparent correlation in the time series data, but not in the data that was actually correlated.

## Samples and populations

The remaining question is why the correlation coefficient $$r$$ requires the data to be i.i.d.  The answer lies in how $$r$$ is calculated.  The mathy answer is a little complicated (see [here](https://stats.stackexchange.com/questions/7376/does-correlation-assume-stationarity-of-data) for a good explanation). In the interests of keeping this post simple and graphical, I'll show some more plots instead of delving into the math.

The context in which $$r$$ is used is that of fitting a linear model to "explain" or predict $$y$$ as a function of $$x$$.  This is just the $$y = mx + b$$ from middle school math class.  The more highly correlated $$x$$ is with $$y$$ (the $$x$$ vs $$y$$ scatter looks more like a line and less like a cloud), the more information the value of $$x$$ gives us about the value of $$y$$.  To get this measure of "cloudiness", we can first fit a line:

![img](/assets/images/correlation/correlated_regression.png "Linear regression on correlated data")

The line represents the value we would predict for $$y$$ given a certain value of $$x$$. We can then measure how far each $$y$$ value is from the predicted value. If we plot those differences, called $$residuals$$, we get:

![img](/assets/images/correlation/correlated_residuals.png "Linear regression on correlated data")

The wider the cloud the more uncertainty we still have about $$y$$.  In more technical words, it's the amount of variance that's still 'unexplained', despite knowing a given $$x$$ value.  The compliment of this, the proportion of variance 'explained' in $$y$$ by $$x$$, is the $$r^2$$ value.  If knowing $$x$$ tells us nothing about $$y$$, then $$r^2$$ = 0.  If knowing $$x$$ tells us $$y$$ exactly, then there is nothing left 'unexplained' about the values of $$y$$, and $$r^2$$ = 1.

$$r$$ is calculated using your sample data.  The assumption and hope is that as you get more data, $$r$$ will get closer and closer to the "true" value, [called Pearson's product-moment correlation coefficient $$\rho$$](https://en.wikipedia.org/wiki/Pearson_product-moment_correlation_coefficient).  If you take chunks of data from different time points like we did above, your $$r$$ should be similar in each case, since you're just taking smaller samples. In fact, if the data is i.i.d., $$r$$ itself can be treated as a variable that's randomly distributed around a "true" value.  If you take chunks of our correlated non-time-series data and calculate their sample correlation coefficients, you get the following:

![img](/assets/images/correlation/correlated_subgroup_correlations.png "Correlation coefficients for smaller chunks of the correlated data")

where the line represents the sample correlation coefficient $$r$$ for the entire sample.  The important thing is that $$r$$ gives you a reasonable idea of what the population $$r$$ is, and becomes a better estimator the more data you get.  If you do the same thing for our time series data, you get something very different:

![img](/assets/images/correlation/fake_subgroup_correlations.png "Correlation coefficients for smaller chunks of the time series data")

As you can see, the sample correlation coefficient varies a LOT depending on what data subset you're using. Why, then, should we assume that the particular sample $$r$$ value we've estimated for our time series is a good estimation of the "true" population correlation coefficient $$\rho$$?  That's right, we shouldn't.

The main takeaway here is that the correlation coefficient $$r$$ is NOT an estimator of the population correlation coefficient $$\rho$$ *when the time series are autocorrelated*.  You can find correlations between time series, but first you have to use some method to "de-trend" the data and take out any autocorrelation. If you do that, the sample $$r$$ value can then be interpreted as an estimator of the true population value.

Since the true value for unrelated variables like the ones in our time series is 0, looking at subpopulations of the differenced, de-trended data should give us correlations of 0.  Critically, each sub-group of the data should have a correlation coefficient that's near the value of the correlation coefficient of the entire sample.

![img](/assets/images/correlation/differenced_subgroup_correlations.png "Correlation coefficients for smaller chunks of the differenced time series data")

I hope this helps clear up the confusion a little.
