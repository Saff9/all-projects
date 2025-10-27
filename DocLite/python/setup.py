from setuptools import setup, find_packages

setup(
    name="doclite",
    version="0.1.0",
    description="Python driver for DocLite: The Serverless Embedded NoSQL Database Engine",
    author="DocLite Contributors",
    url="https://github.com/saff9/DocLite",
    py_modules=["doclite"],
    package_dir={"": "."},
    python_requires=">=3.8",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "License :: OSI Approved :: Apache Software License",
        "Topic :: Database",
    ],
)
