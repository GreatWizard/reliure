from debian:stable-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
  curl \
  && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
  && apt-get install -y --no-install-recommends \
  nodejs \
  npm \
  openjdk-17-jre \
  pandoc \
  tar \
  unzip \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g \
  reliure

RUN curl -0L https://archive.org/download/kindlegen_linux_2_6_i386_v2_9/kindlegen_linux_2.6_i386_v2_9.tar.gz -o /tmp/kindlegen.tar.gz \
  && mkdir -p /tmp/kindlegen \
  && tar xzf /tmp/kindlegen.tar.gz -C /tmp/kindlegen \
  && mv /tmp/kindlegen/kindlegen /usr/local/bin/kindlegen \
  && chmod +x /usr/local/bin/kindlegen \
  && rm -rf /tmp/kindlegen.tar.gz /tmp/kindlegen

RUN useradd -ms /bin/bash reliure

USER reliure

WORKDIR /home/reliure

RUN curl -0L https://github.com/w3c/epubcheck/releases/download/v4.2.6/epubcheck-4.2.6.zip -o /tmp/epubcheck.zip  \
  && unzip /tmp/epubcheck.zip -d ~/ \
  && mv ~/epubcheck-4.2.6 ~/epubcheck \
  && rm -rf /tmp/epubcheck.zip

RUN echo "*** node" \
  && node --version \
  && echo "\n*** npm" \
  && npm --version \
  && echo "\n*** java" \
  && java -version \
  && echo "\n*** pandoc" \
  && pandoc --version \
  && echo "\n*** reliure" \
  && reliure --version \
  && echo "\n*** kindlegen" \
  && kindlegen \
  && echo "\n*** epubcheck" \
  && java -jar ~/epubcheck/epubcheck.jar --version \
  ; echo "\n*** Done."

ENTRYPOINT ["reliure"]
CMD ["--help"]
