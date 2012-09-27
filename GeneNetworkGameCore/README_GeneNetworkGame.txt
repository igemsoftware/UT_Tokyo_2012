README_GeneNetworkGame.txt


For a basic description of Gene Network Game, please visit : 
http://2012.igem.org/Team:UT-Tokyo-Software/Project/GeneNetworkGame

To use Gene Network Game :

0.Install Eclipse, and Proclipsing
Gene Network Game uses Eclipse and Proclipsing so you need to install them.
They are available at http://www.eclipse.org/downloads/ and http://code.google.com/p/proclipsing/
Then, install Proclipsing into Eclipse.

1.Download this file

2.Load the file on Eclipse

3.Press Run button and the Gene Network Game will start


Or you can use this software on your browser without download : 
http://igem-ut.net/2012sw/gene_network_game/applet/


----------------------------------------------------------

Technical informations about stage editor

You can change following parameters.

<Promoters>
-Name
-Type … 0: repressed
           … 1: activated
-Strength: promoter strength
-# of genes
-Factor name : the protein which the promoter is regulated
-K : Hill's constant
-N : Hill's constant
   
<Genes>
-Name
-Degradation speed
-Copy rate
-# of genes
-initial value
-input type … 0 : it isn't input
                   … 1 : step-on ( 0 for t<(timing), (strength) for t>(timing) )
                   … 2 : step-off ( (strength) for t<(timing), 0 for t>(timing) )
-timing : the time input changes
-strength : the strength of the input

<differential equations>
d/dt (protein concentration) = [sum of promoters] (promoter strength) / (1 + ((K/(input concentration))^N))

<stage data>
The list of stages are written in /data/stages/stagelist.txt
Eacb stage data are stored in /data/stages/(stagename).txt
and thumbnail of the stage in /data/imgs/(stagename).png
You can also edit them directory.
