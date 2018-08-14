
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
