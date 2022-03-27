FROM --platform='linux/x86_64' debian:10

# Maintained by Tyler W. H. Backman.
LABEL maintainer="satyarth@lbl.gov"

# Mentioning the current user.
USER root

# Specifying the language as environment variable.
ENV LANG C.UTF-8

# Creating working directory.
WORKDIR /root

# Adding local requirement file to the docker environment for pip installation.
ADD ./requirements.txt /root/

# Fixing md5sum for comic_neue font in CMakeLists.txt. Or else the build breaks.
ENV COMIC_NEUE 850b0df852f1cda4970887b540f8f333
ENV COMIC_NEUE_INCORRECT 23ed3f833c1ae0adb141a26b4a30d73e

# Run this to avoid error while adding the PostgreSQL keys.
RUN apt-get update \
    && apt-get install -y gnupg2 \
    && apt-get install -y lsb-release \
    && apt-get clean all

# Add the PostgreSQL PGP key to verify their Debian packages.
# It should be the same key as https://www.postgresql.org/media/keys/ACCC4CF8.asc
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8

# Add PostgreSQL's repository containing latest stable release of PostgreSQL.
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# include Debian packages required to build pip packages
RUN apt-get update \
    && apt-get install -y \
    python3-pip \
    python3-all \
    python3-all-dev \
    python3-tk \
    python3-numpy \
    software-properties-common \
    postgresql \
    postgresql-client \
    postgresql-server-dev-all \
    postgresql-server-dev-11 \
    vim \
    wget \
    unzip \
    build-essential \
    cmake \
    python3-dev \
    sqlite3 \
    libsqlite3-dev \
    libboost-dev \
    libboost-all-dev \
    libboost-system1.67-dev \
    libboost-thread1.67-dev \
    libboost-serialization1.67-dev \
    libboost-python1.67-dev \
    libboost-regex1.67-dev \
    libboost-iostreams1.67-dev \
    libxrender1 \
    libxext6 \
    libeigen3-dev \
    openjdk-11-jdk \
    openjdk-11-jre \
    sudo \
    ncbi-blast+ \
    libigraph0v5 \
    libigraph0-dev \
    zlib1g-dev \
    libcairo2-dev \
    mlocate \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

RUN updatedb

# install pip packages from requirements.txt
# note: requirements.txt can be updated with 'pip3 install pur; pur -r requirements.txt'
RUN pip3 install -U pip setuptools
# RUN pip3 install -r requirements.txt
RUN pip3 install pur; pur -r requirements.txt
RUN pip3 install django pandas jupyter

# RDKIT installation: setting environment variables
ENV RDKIT_VERSION Release_2021_09
ENV RDBASE /root/rdkit-$RDKIT_VERSION
ENV LD_LIBRARY_PATH $RDBASE/lib
ENV PYTHONPATH $PYTHONPATH:$RDBASE

# RDKIT installation: Download the desired version of RDKit source code.
RUN wget https://github.com/rdkit/rdkit/archive/$RDKIT_VERSION.tar.gz && \
    tar xfz $RDKIT_VERSION.tar.gz && \
    rm $RDKIT_VERSION.tar.gz

# RDKIT installation: Replacing the existing comic_neue md5sum with the new one to avoid verification error.
RUN sed -i "s/$COMIC_NEUE_INCORRECT/$COMIC_NEUE/" /root/rdkit-$RDKIT_VERSION/Code/GraphMol/MolDraw2D/CMakeLists.txt
# sed -i "s/`cat comic_neue_incorrect.md5`/`cat comic_neue.md5`/" /root/rdkit-$RDKIT_VERSION/Code/GraphMol/MolDraw2D/CMakeLists.txt && \

# RDKIT installation: compile and install rdkit from source code.
RUN cd /root/rdkit-$RDKIT_VERSION/External/INCHI-API && \
    ./download-inchi.sh && \
    cd /root/rdkit-$RDKIT_VERSION && \
    mkdir build && \
    cd build && \
    cmake \
    -D Py_ENABLE_SHARED=1 \
    -D PYTHON_EXECUTABLE=/usr/bin/python3 \
    -D RDK_INSTALL_INTREE=ON \
    -D RDK_BUILD_INCHI_SUPPORT=ON \
    -D RDK_BUILD_AVALON_SUPPORT=ON \
    -D RDK_BUILD_PYTHON_WRAPPERS=ON \
    -D RDK_BUILD_CAIRO_SUPPORT=ON \
    -D RDK_BUILD_CPP_TESTS=ON \
    -D PYTHON_NUMPY_INCLUDE_PATH="$(python3 -c 'import numpy ; print(numpy.get_include())')" \
    -D RDK_BUILD_PGSQL=ON \
    -D PostgreSQL_TYPE_INCLUDE_DIR=/usr/include/postgresql/11/server \
    -D PostgreSQL_ROOT=/usr \
    .. && \
    make -j `grep -c ^processor /proc/cpuinfo` && \
    make install && \
    chmod u+x /root/rdkit-$RDKIT_VERSION/build/Code/PgSQL/rdkit/pgsql_install.sh && \
    /root/rdkit-$RDKIT_VERSION/build/Code/PgSQL/rdkit/pgsql_install.sh

# create postgresql user and database (the sort command is used to get the latest version of postgres)
RUN echo "host all  all    0.0.0.0/0  md5" >> /etc/postgresql/`ls /etc/postgresql | sort -n | tail -1`/main/pg_hba.conf
RUN echo "listen_addresses='*'" >> /etc/postgresql/`ls /etc/postgresql | sort -n | tail -1`/main/postgresql.conf
RUN echo "shared_buffers = 1024MB" >> /etc/postgresql/`ls /etc/postgresql | sort -n | tail -1`/main/postgresql.conf
RUN echo "work_mem = 128MB" >> /etc/postgresql/`ls /etc/postgresql | sort -n | tail -1`/main/postgresql.conf
RUN echo "synchronous_commit = off" >> /etc/postgresql/`ls /etc/postgresql | sort -n | tail -1`/main/postgresql.conf

USER postgres
WORKDIR /
RUN /etc/init.d/postgresql start &&\
    psql -c "CREATE USER clustercad WITH SUPERUSER PASSWORD 'clustercad';" &&\
    createdb -O clustercad clustercad

# # Creating RDKit extension for PostgreSQL - RDKit cartridge installation.
# RUN psql -d clustercad -c "create extension if not exists rdkit; create schema rdk;"

VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]
EXPOSE 5432

USER root

# To start the postgresql daemon.
RUN /etc/init.d/postgresql start


# TODO: Need to install Django
RUN wget https://github.com/satyarth934/django-mysite/archive/main.tar.gz && \
    mv main.tar.gz django-mysite-main.tar.gz && \
    tar -xvzf django-mysite-main.tar.gz
