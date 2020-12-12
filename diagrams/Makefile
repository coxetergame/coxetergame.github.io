%: %.pdf
	convert -density 600 -size 1000 $< $(basename $@).png

%.pdf: %.ps
	ps2pdf $<

%.ps: %.dvi
	dvips $<

%.dvi: %.tex
	latex $<
	rm -f $(basename $@).{log,aux}
