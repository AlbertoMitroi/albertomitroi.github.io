#!/usr/bin/env python3
"""Generate the public, ATS-friendly PDF resume."""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "CV_AlbertoMitroi.pdf"

NAVY = HexColor("#172033")
BLUE = HexColor("#1769AA")
GRAY = HexColor("#4B5563")


def styles():
    base = getSampleStyleSheet()
    return {
        "name": ParagraphStyle(
            "Name",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=21,
            leading=24,
            textColor=NAVY,
            spaceAfter=2,
        ),
        "role": ParagraphStyle(
            "Role",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11.5,
            leading=14,
            textColor=BLUE,
            spaceAfter=4,
        ),
        "contact": ParagraphStyle(
            "Contact",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.6,
            leading=11,
            textColor=GRAY,
            spaceAfter=8,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10.2,
            leading=12,
            textColor=NAVY,
            spaceBefore=8,
            spaceAfter=4,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=11.6,
            textColor=NAVY,
            alignment=TA_LEFT,
            spaceAfter=3,
        ),
        "skills": ParagraphStyle(
            "Skills",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=10.8,
            textColor=NAVY,
            spaceAfter=2,
        ),
        "company": ParagraphStyle(
            "Company",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9.8,
            leading=11.8,
            textColor=NAVY,
            spaceBefore=5,
            spaceAfter=1,
            keepWithNext=True,
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.4,
            leading=10.2,
            textColor=GRAY,
            spaceAfter=1.5,
            keepWithNext=True,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=10.7,
            textColor=NAVY,
            leftIndent=9,
            firstLineIndent=-7,
            spaceAfter=1.4,
        ),
    }


def section(story, style, title):
    story.append(Paragraph(title, style["section"]))


def bullet(story, style, text):
    story.append(Paragraph(f"- {text}", style["bullet"]))


def job(story, style, company, location, title, period, bullets):
    story.append(Paragraph(f"{company} | {location}", style["company"]))
    story.append(Paragraph(f"{title} | {period}", style["meta"]))
    for item in bullets:
        bullet(story, style, item)


def project(story, style, name, context, bullets, technologies):
    story.append(Paragraph(name, style["company"]))
    story.append(Paragraph(context, style["meta"]))
    for item in bullets:
        bullet(story, style, item)
    story.append(Paragraph(f"<b>Technologies:</b> {technologies}", style["meta"]))


def set_metadata(canvas, document):
    canvas.setTitle("Alberto Mitroi - Full Stack Software Engineer")
    canvas.setAuthor("Alberto Mitroi")
    canvas.setSubject("Full Stack Software Engineer with 4 years of hands-on C#, .NET and Python development experience")
    canvas.setKeywords(
        "C# Developer, .NET Developer, .NET Software Engineer, Full Stack Developer, Full Stack Software Engineer, "
        "Backend Developer, Software Engineer, Software Developer, Python Developer, Automation Developer, "
        "4 years C# experience, .NET 8, .NET Core, ASP.NET Core, Web API, REST APIs, "
        "Entity Framework Core, LINQ, async await, dependency injection, MediatR, FluentValidation, "
        "xUnit, unit testing, integration testing, code review, SOLID, OOP, design patterns, "
        "microservices, distributed systems, Microsoft Azure, Azure Developer Associate, AZ-204, "
        "Angular, React, Next.js, TypeScript, JavaScript, HTML, CSS, "
        "Kafka, RabbitMQ, Azure Service Bus, message queues, event-driven architecture, "
        "CQRS, Domain-Driven Design, Clean Architecture, Vertical Slice Architecture, Event Sourcing, Marten, "
        "PostgreSQL, SQL Server, Elasticsearch, Redis, "
        "Docker, containers, CI/CD, Azure DevOps, GitHub Actions, Git, Agile, Scrum, SDLC, "
        "Python, CLI automation, scripting, process orchestration, Windows desktop development, GUI, VBA, "
        "Azure OpenAI, LLM, RAG, semantic search, embeddings, conversational AI, voice AI, AI agents, prompt engineering"
    )


def decorate_page(canvas, document):
    # No running header or footer: some ATS parsers read page furniture before the
    # body text, or drop it entirely. Keeping the page to body text only is safest.
    set_metadata(canvas, document)


def build():
    style = styles()
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=10 * mm,
        bottomMargin=14 * mm,
        title="Alberto Mitroi - Full Stack Software Engineer",
        author="Alberto Mitroi",
        subject="Full Stack Software Engineer resume",
    )

    story = [
        Paragraph("Alberto Mitroi", style["name"]),
        Paragraph("Full Stack Software Engineer | C#/.NET Developer | Azure, Angular, React, TypeScript, Python | Applied AI", style["role"]),
        Paragraph(
            'Craiova, Romania | <link href="tel:+40745915532">+40 745 915 532</link> | '
            '<link href="mailto:mitroialbertoionut@gmail.com">mitroialbertoionut@gmail.com</link> | '
            '<link href="https://www.linkedin.com/in/mitroialberto/">linkedin.com/in/mitroialberto</link> | '
            "<br/>"
            '<link href="https://albertomitroi.github.io/">albertomitroi.github.io</link> | '
            '<link href="https://github.com/AlbertoMitroi">github.com/AlbertoMitroi</link>',
            style["contact"],
        ),
    ]

    section(story, style, "SUMMARY")
    story.append(
        Paragraph(
            "Full Stack Software Engineer with 4 years of hands-on C#/.NET development experience and a strong Python automation "
            "background. Builds production-facing .NET 8 services, REST APIs, microservices, desktop automation tools and "
            "React/Angular applications. Experience spans distributed and event-driven systems, Microsoft Azure, Docker, CI/CD, "
            "unit and integration testing, workflow automation and applied AI across product teams, startup delivery and "
            "independent software development. Microsoft Certified: Azure Developer Associate (AZ-204).",
            style["body"],
        )
    )

    section(story, style, "CORE SKILLS")
    skill_lines = [
        ("Languages", "C#, Python, TypeScript, JavaScript, SQL, VBA, HTML, CSS"),
        ("C# and .NET", ".NET 8, .NET Core, ASP.NET Core, Web API, REST APIs, Entity Framework Core, LINQ, async/await, Dependency Injection, MediatR, FluentValidation, xUnit"),
        ("Architecture", "Microservices, Domain-Driven Design, CQRS, Clean Architecture, Vertical Slice Architecture, Event-Driven Architecture, Event Sourcing, SOLID, OOP, Design Patterns"),
        ("Messaging and data", "Kafka, RabbitMQ, Azure Service Bus, PostgreSQL, SQL Server, Marten, Elasticsearch, Redis, Database Modeling, Migrations"),
        ("Frontend", "Angular, React, Next.js, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, tRPC, Prisma ORM"),
        ("Azure and DevOps", "Microsoft Azure, Container Apps, App Service, Azure SQL, Blob Storage, Key Vault, Application Insights, Azure DevOps, GitHub Actions, CI/CD, Docker, Git"),
        ("Automation and scripting", "Python, CLI automation, process orchestration, Windows desktop development, GUI development, file processing, data parsing, report generation, logging"),
        ("Applied AI", "Azure OpenAI, RAG, Large Language Models, Semantic Search, Embeddings, Conversational AI, Voice AI, AI Agents, Prompt Engineering"),
        ("Practices", "Agile, Scrum, SDLC, Code Reviews, Unit Testing, Integration Testing, Debugging, Observability, Technical Documentation"),
    ]
    for label, value in skill_lines:
        story.append(Paragraph(f"<b>{label}:</b> {value}", style["skills"]))

    section(story, style, "EXPERIENCE")
    job(
        story,
        style,
        "Encora Inc. (part of Coforge)",
        "Craiova, Romania (Hybrid)",
        ".NET Full Stack Developer",
        "Jul 2024 - Present | Full-time",
        [
            "Engineer and support production .NET 8 services, REST APIs and Angular features for a distributed insurance platform serving the UK market.",
            "Delivered .NET 8 backend services and Angular features for a trading application using dependency injection, Clean Architecture, automated testing and code reviews.",
            "Design and implement asynchronous domain workflows with Kafka, RabbitMQ and Azure Service Bus across a microservices architecture.",
            "Model event-sourced workflows with CQRS, MediatR, Domain-Driven Design, Marten and PostgreSQL; build operational and search views in Elasticsearch.",
            "Own work through delivery and operations, including unit and integration testing, Azure CI/CD releases, incident analysis and reliability improvements.",
            "Work in an Agile/Scrum team across the full SDLC, from refinement and design through code review, testing and production support.",
        ],
    )
    job(
        story,
        style,
        "Oryntech",
        "Craiova, Romania (Remote)",
        "AI Solutions Engineer &amp; Co-CTO",
        "Mar 2026 - Present | Part-time",
        [
            "Co-lead technical architecture and build full-stack AI product features and workflow automations for service businesses.",
            "Deliver React, Next.js and TypeScript interfaces integrated with REST APIs, webhooks, CRM and booking workflows.",
            "Implement voice and chat agent flows with LLM integration and prompt engineering for customer conversations, lead follow-up and multi-channel messaging.",
            "Harden AI workflows with context management, guardrails, human handoff, testing and reliability controls.",
        ],
    )
    job(
        story,
        style,
        "FORVIA HELLA",
        "Craiova, Romania (Hybrid)",
        "Software Automation Developer",
        "Nov 2023 - Jul 2024",
        [
            "Developed C#, .NET and Python automation tools and scripts that reduced repetitive manual engineering work.",
            "Built internal desktop GUI applications with C# and VBA, and automated data processing, file handling and report generation.",
            "Tested automotive control-system software and improved validation workflows in collaboration with engineering teams.",
        ],
    )
    job(
        story,
        style,
        "Mecafix CNC",
        "Craiova, Romania",
        "Software Developer - C# / Python",
        "Sep 2022 - Nov 2023 | Part-time",
        [
            "Developed a Windows desktop application in C#/.NET for automating and orchestrating production-preparation workflows in a metalworking and CNC environment.",
            "Integrated Python scripts and CLI-based utilities for file processing, job validation, data parsing and report generation.",
            "Implemented process execution and orchestration, command-line argument management, stdout/stderr capture, asynchronous background tasks, logging, validation and error handling.",
            "Built a graphical interface that allowed users to configure, launch and monitor automation workflows without interacting directly with command-line tools.",
            "Structured reusable and maintainable components using OOP, SOLID principles, async/await, dependency injection and configuration management.",
        ],
    )
    story.append(
        Paragraph(
            "<b>Technologies:</b> C#, .NET, Python, Windows desktop development, CLI automation, process orchestration, "
            "async/await, OOP, SOLID, dependency injection, logging, Git",
            style["meta"],
        )
    )

    section(story, style, "EDUCATION")
    story.append(Paragraph("Faculty of Automation, Computers and Electronics | University of Craiova", style["company"]))
    story.append(Paragraph("Master's degree, Artificial Intelligence and Applied Computing | Aug 2026 - Jul 2028", style["meta"]))
    story.append(Paragraph("Bachelor of Engineering, Computer Science and Information Technology | Sep 2022 - Jul 2026", style["meta"]))

    section(story, style, "CERTIFICATIONS")
    certs = [
        'Microsoft Certified: Azure Developer Associate (AZ-204) | Microsoft | <link href="https://learn.microsoft.com/en-us/users/albertomitroi/credentials/42efc399d66b1e5c">Credential ID 42EFC399D66B1E5C</link> | Mar 2026',
        'Introduction to Generative AI for Software Development | DeepLearning.AI | <link href="https://www.coursera.org/account/accomplishments/verify/G503GKSPZ3IO">Credential ID G503GKSPZ3IO</link> | Jul 2025',
        'Generative AI with Large Language Models | Amazon Web Services | <link href="https://www.coursera.org/account/accomplishments/verify/A3COZZP9ND79">Credential ID A3COZZP9ND79</link> | Jul 2025',
    ]
    for cert in certs:
        bullet(story, style, cert)

    section(story, style, "PROJECT EXPERIENCE")
    project(
        story,
        style,
        "EShopMicroservices",
        '<link href="https://github.com/AlbertoMitroi/EShopMicroservices">github.com/AlbertoMitroi/EShopMicroservices</link>',
        [
            "Built a .NET 8 and C# 12 e-commerce reference architecture with ASP.NET Core, Entity Framework Core and REST APIs.",
            "Applied Domain-Driven Design, CQRS, Clean Architecture, Vertical Slice Architecture, MediatR, FluentValidation and automated testing.",
            "Implemented RabbitMQ, Kafka and Redis communication, Docker packaging, GitHub Actions CI/CD and Azure-oriented deployment patterns.",
        ],
        ".NET 8, C# 12, ASP.NET Core, Web API, Entity Framework Core, Microservices, DDD, CQRS, MediatR, FluentValidation, RabbitMQ, Kafka, Redis, Docker, GitHub Actions, Azure",
    )
    project(
        story,
        style,
        "Oryntech.AI",
        '<link href="https://www.oryntech.ai">oryntech.ai</link> | Full-stack product and applied AI work',
        [
            "Develop React, Next.js and TypeScript interfaces for AI-assisted service-business workflows.",
            "Build conversational and voice-agent features with LLM integration, context management, guardrails, human handoff and reliability controls.",
            "Integrate CRM, email, SMS, booking, analytics, APIs and webhooks into multi-channel automation workflows.",
        ],
        "React, Next.js, TypeScript, Tailwind CSS, Framer Motion, OpenAI, LLM Integration, Conversational AI, Voice AI, CRM, APIs, Webhooks, Workflow Automation",
    )
    project(
        story,
        style,
        "TopZonal",
        "Independent full-stack product | In development",
        [
            "Build a mobile-first local-services PWA with React, Next.js, TypeScript, tRPC, Prisma ORM and a monorepo architecture.",
            "Design Azure-oriented components using Docker, Azure Container Apps, Azure SQL, Blob Storage and Azure Key Vault.",
            "Prototype semantic search, embeddings, vector retrieval and RAG-assisted discovery with Azure OpenAI.",
        ],
        "React, Next.js, TypeScript, T3 Stack, tRPC, Prisma ORM, PWA, Docker, Azure Container Apps, Azure SQL, Blob Storage, Key Vault, Azure OpenAI, RAG",
    )

    document.build(story, onFirstPage=decorate_page, onLaterPages=decorate_page)


if __name__ == "__main__":
    build()
