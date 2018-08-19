
data<-read.csv("../stats.txt",header = TRUE, sep = ",")
structure=na.omit(data)
#nostruct=data[apply(is.na(data$TM), 1, any),]
nostruct=data[which(is.na(data$tm) &! is.na(data$fdr)),]
nostruct$logMeff=log(nostruct$Meff)
structure$logMeff=log(structure$Meff)

structPcons<-density(structure$pcons)
nostructPcons<-density(nostruct$pcons)
structProQ<-density(structure$proq3)
nostructProQ<-density(nostruct$proq3)
structMeff<-density(structure$Meff)
nostructMeff<-density(nostruct$Meff)
structlogMeff<-density(structure$logMeff)
nostructlogMeff<-density(nostruct$logMeff)
structFDR<-density(structure$fdr)
nostructFDR<-density(nostruct$fdr)

postscript("density_pcons.eps", width=8,height=8,paper="special",horizontal=F,onefile=F,colormodel="rgb")
plot(nostructPcons,main="Pcons", xlab="Pcons", ylab="Density",col="red")
lines(structPcons,col="blue")
legend(0.5,3, legend=c("Structure", "No structure"), col=c("blue", "red"), lty=1:2, cex=0.8)
dev.off()

postscript("density_proq.eps", width=8,height=8,paper="special",horizontal=F,onefile=F,colormodel="rgb")
plot(nostructProQ,main="ProQ3D ", xlab="ProQ3D", ylab="Density",col="red")
lines(structProQ,col="blue")
legend(0.6,2.5, legend=c("Structure", "No structure"), col=c("blue", "red"), lty=1:2, cex=0.8)
dev.off()

postscript("density_meff.eps", width=8,height=8,paper="special",horizontal=F,onefile=F,colormodel="rgb")
plot(nostructlogMeff,main="Meff", xlab="log(Meff)", ylab="Density",col="red")
lines(structlogMeff,col="blue")
legend(8,0.24, legend=c("Structure", "No structure"), col=c("blue", "red"), lty=1:2, cex=0.8)
dev.off()

postscript("density_fdr.eps", width=8,height=8,paper="special",horizontal=F,onefile=F,colormodel="rgb")
plot(nostructFDR,main="FDR", xlab="Fdr", ylab="Density",col="red")
lines(structFDR,col="blue")
legend(0.1,3, legend=c("Structure", "No structure"), col=c("blue", "red"), lty=1:2, cex=0.8)
dev.off()


ma <- function(x,n=50){filter(x,rep(1/n,n), sides=2)}

library(scales)



#postscript("figures/meff-pcons.eps", width=8,height=8,paper="special",horizontal=F,onefile=F,colormodel="rgb")
plot(nostructProQ,main="ProQ3D ", xlab="ProQ3D", ylab="Density",col="red")
lines(structProQ,col="blue")
legend(0.6,2.5, legend=c("Structure", "No structure"), col=c("blue", "red"), lty=1:2, cex=0.8)
legend(1,0.7, legend=c("Structure", "No structure"), col=c("blue", "red"), lty=1:2, cex=0.8)
dev.off()



#postscript("figures/meff-pcons.eps", width=8,height=8,paper="special",horizontal=F,onefile=F,colormodel="rgb")
cairo_ps(file = "figures/meff-proq3d.eps", onefile = FALSE, fallback_resolution = 600)
plot(log10(structure$Meff),structure$proq,,cex=0.6,col = alpha("lightblue", 0.4),xlab="log(Meff)",ylab="ProQ3d")
points(log10(nostruct$Meff),nostruct$proq,cex=0.6,pch=0,col = alpha("pink", 0.4))
points(log10(structure$Meff[order(structure$Meff)]),ma(structure$proq[order(structure$Meff)]), col=alpha("blue",0.2))
points(log10(nostruct$Meff[order(nostruct$Meff)]),ma(nostruct$proq[order(nostruct$Meff)]), col=alpha("red",0.2))
legend(1,0.7, legend=c("Structure", "No structure"), col=c("blue", "red"), lty=1:2, cex=0.8)
dev.off()

#postscript("figures/meff-pcons.eps", width=8,height=8,paper="special",horizontal=F,onefile=F,colormodel="rgb")
cairo_ps(file = "figures/meff-TM.eps", onefile = FALSE, fallback_resolution = 600)
plot(log10(structure$Meff),structure$tm,,cex=0.6,col = alpha("lightblue", 0.4),xlab="log(Meff)",ylab="TM")
points(log10(structure$Meff[order(structure$Meff)]),ma(structure$tm[order(structure$Meff)]), col=alpha("blue",0.2))
dev.off()


#postscript("figures/meff-pcons.eps", width=8,height=8,paper="special",horizontal=F,onefile=F,colormodel="rgb")
cairo_ps(file = "figures/meff-PPV.eps", onefile = FALSE, fallback_resolution = 600)
plot(log10(structure$Meff),structure$ppv,,cex=0.6,col = alpha("lightblue", 0.4),xlab="log(Meff)",ylab="PPV")
points(log10(structure$Meff[order(structure$Meff)]),ma(structure$ppv[order(structure$Meff)]), col=alpha("blue",0.2))
dev.off()

