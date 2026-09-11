#!/usr/bin/env python3
"""Build the two-page, text-based CV and matching Markdown/plain-text versions.

Usage: python3 scripts/generate_ats_cv.py [--output path/to/cv.pdf]
Requires reportlab. Keep employment facts distinct from independent projects.
"""
import argparse
from html import escape
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak

ROOT = Path(__file__).resolve().parents[1]
NAME = 'Alberto Mitroi'
HEADLINE = '.NET Software Engineer | C#, Azure, Angular'
SUMMARY = (
    'Software engineer building C# and .NET applications since 2022. Develops production '
    '.NET 8 services, REST APIs and Angular features for a UK insurance platform. Implements '
    'event-sourced domain workflows and asynchronous microservice integrations, with ownership '
    'through testing, Azure releases and production incident analysis. Additional experience '
    'in React, Next.js and Python automation.'
)
CONTACT = [
    'Craiova, Romania | +40 745 915 532 | mitroialbertoionut@gmail.com',
    'linkedin.com/in/mitroialberto | github.com/AlbertoMitroi',
    'albertomitroi.github.io',
]
SKILLS = [
    ('Backend', 'C#, .NET 8, ASP.NET Core, REST APIs, Entity Framework Core, MediatR'),
    ('Data & messaging', 'SQL, PostgreSQL, Marten, Elasticsearch, Kafka, RabbitMQ, Azure Service Bus'),
    ('Frontend', 'Angular, React, Next.js, TypeScript, JavaScript, HTML, CSS'),
    ('Delivery', 'Microsoft Azure, Azure DevOps, Docker, Git, CI/CD, unit and integration testing'),
]
ENCORA = [
    'Develop and support .NET 8 services, REST APIs and Angular features for a production insurance platform serving the UK market.',
    'Implement asynchronous workflows across microservices using Kafka, RabbitMQ and Azure Service Bus.',
    'Model event-sourced insurance workflows with CQRS, MediatR, Domain-Driven Design, Marten and PostgreSQL; build operational and search views in Elasticsearch.',
    'Own feature delivery through automated testing, Azure releases and production incident analysis.',
    'Apply Clean Architecture and dependency injection in backend development, with automated tests and code reviews.',
]
HELLA = [
    'Developed C#, .NET and Python tools to automate repetitive automotive engineering tasks, including data processing, file handling and report generation.',
    'Built internal desktop interfaces with C# and VBA; tested automotive control-system software and worked with engineering teams on validation workflows.',
]
MECAFIX = [
    'Built a C#/.NET Windows desktop application to automate production-preparation workflows in a metalworking and CNC environment.',
    'Integrated Python scripts and command-line utilities for file processing, job validation, data parsing and report generation.',
    'Added background tasks, logging, validation and error handling, with a graphical interface for configuring, running and monitoring workflows.',
]
ORYNTECH = [
    'Co-lead technical architecture and develop React, Next.js and TypeScript interfaces for service-business workflows, integrating REST APIs, webhooks, CRM and booking systems.',
    'Build Python services and voice and chat agent flows for customer conversations, lead follow-up and multi-channel messaging.',
    'Implement context management, guardrails, human handoff and testing for LLM-powered workflows.',
]
ESHOP = [
    'Built a .NET 8 and C# 12 e-commerce reference project using ASP.NET Core REST APIs, Entity Framework Core, Domain-Driven Design and CQRS.',
    'Applied MediatR, FluentValidation and automated testing; used RabbitMQ, Redis, Docker and GitHub Actions with Azure-oriented deployment patterns.',
]
TOPZONAL = [
    'Developing a local-services progressive web app with React, Next.js, TypeScript, tRPC and Prisma ORM.',
    'Designing Azure components using Docker, Container Apps, Azure SQL, Blob Storage and Key Vault; prototyping semantic search and retrieval-augmented generation (RAG) with Azure OpenAI.',
]


def content():
    """Semantic blocks are shared by all output formats."""
    blocks = [('name', NAME), ('headline', HEADLINE)]
    blocks += [('contact', x) for x in CONTACT]
    blocks += [('section', 'SUMMARY'), ('body', SUMMARY),
               ('credential', 'Microsoft Certified: Azure Developer Associate (AZ-204) | Mar 2026'),
               ('section', 'PROFESSIONAL EXPERIENCE')]
    def job(company, title, dates, location, bullets):
        return [('company', company), ('title', title), ('meta', dates + ' | ' + location)] + [('bullet', x) for x in bullets]
    blocks += job('Encora Inc.', '.NET Full Stack Engineer | Full-time', 'Jul 2024 - Present', 'Craiova, Romania | Hybrid', ENCORA)
    blocks += job('FORVIA HELLA', 'Software Developer | Full-time', 'Nov 2023 - Jul 2024', 'Craiova, Romania | Hybrid', HELLA)
    blocks += job('Mecafix CNC', 'Software Developer | Full-time', 'Sep 2022 - Nov 2023', 'Craiova, Romania', MECAFIX)
    blocks += [('section', 'TECHNICAL SKILLS')]
    blocks += [('skill', f'{k}: {v}') for k, v in SKILLS]
    blocks += [('break', ''), ('section', 'ADDITIONAL EXPERIENCE')]
    blocks += job('Oryntech', 'AI Solutions Engineer & Co-CTO | Part-time', 'Mar 2026 - Present', 'Craiova, Romania | Remote', ORYNTECH)
    blocks += [('section', 'SELECTED PROJECTS'), ('company', 'EShopMicroservices'),
               ('meta', 'Independent reference project | github.com/AlbertoMitroi/EShopMicroservices')]
    blocks += [('bullet', x) for x in ESHOP]
    blocks += [('company', 'TopZonal'), ('meta', 'Independent project | In development')]
    blocks += [('bullet', x) for x in TOPZONAL]
    blocks += [('section', 'ADDITIONAL TECHNICAL SKILLS'),
               ('skill', 'Backend & design: LINQ, async/await, dependency injection, FluentValidation, xUnit, SOLID, Clean Architecture, event sourcing'),
               ('skill', 'Project technologies: SQL Server, Redis, GitHub Actions, Tailwind CSS, tRPC, Prisma ORM'),
               ('skill', 'Automation: Python, Windows desktop applications, CLI integration, background tasks, logging'),
               ('section', 'CERTIFICATIONS'),
               ('body', 'Microsoft Certified: Azure Developer Associate (AZ-204) | Microsoft | Mar 2026'),
               ('credential_link', 'learn.microsoft.com/en-us/users/albertomitroi/credentials/42efc399d66b1e5c'),
               ('section', 'EDUCATION'),
               ('company', 'University of Craiova'),
               ('body', "Master's degree, Artificial Intelligence and Applied Computing"),
               ('meta', 'Aug 2026 - Present | Expected Jul 2028'),
               ('body', 'Bachelor of Engineering, Computer Science and Information Technology'),
               ('meta', 'Sep 2022 - Jul 2026')]
    return blocks


def styles():
    base = dict(fontName='Helvetica', fontSize=10, leading=13, textColor=colors.HexColor('#172033'), spaceAfter=3)
    def s(name, **kw):
        return ParagraphStyle(name, **(base | kw))
    return {
        'name': s('name', fontName='Helvetica-Bold', fontSize=23, leading=27, spaceAfter=4),
        'headline': s('headline', fontName='Helvetica-Bold', fontSize=12, leading=16, spaceAfter=6),
        'contact': s('contact', fontSize=9, leading=12, spaceAfter=1),
        'section': s('section', fontName='Helvetica-Bold', fontSize=10.5, leading=14, spaceBefore=11, spaceAfter=5, keepWithNext=True),
        'body': s('body'),
        'credential': s('credential', fontName='Helvetica-Bold', fontSize=9.5, leading=13, spaceBefore=3),
        'skill': s('skill', fontSize=9.5, leading=12.5, spaceAfter=3),
        'company': s('company', fontName='Helvetica-Bold', fontSize=11, leading=14, spaceBefore=6, spaceAfter=2, keepWithNext=True),
        'title': s('title', fontName='Helvetica-Bold', fontSize=10, leading=13, spaceAfter=2, keepWithNext=True),
        'meta': s('meta', fontSize=9, leading=12, textColor=colors.HexColor('#46505C'), spaceAfter=5, keepWithNext=True),
        'bullet': s('bullet', leftIndent=10, firstLineIndent=-8, spaceAfter=4),
        'credential_link': s('credential_link', fontSize=8.5, leading=12),
    }


def markup(kind, text):
    out = escape(text)
    if kind == 'bullet':
        return '- ' + out
    if kind == 'skill':
        label, value = out.split(': ', 1)
        return '<b>' + label + ':</b> ' + value
    if kind == 'credential_link':
        return '<link href="https://' + out + '">' + out + '</link>'
    for url in ['linkedin.com/in/mitroialberto', 'github.com/AlbertoMitroi/EShopMicroservices', 'github.com/AlbertoMitroi', 'albertomitroi.github.io']:
        if url in text:
            return out.replace(url, '<link href="https://' + url + '">' + url + '</link>')
    return out


def build(output):
    output.parent.mkdir(parents=True, exist_ok=True)
    blocks = content()
    st = styles()
    story = []
    for kind, text in blocks:
        if kind == 'break':
            story.append(PageBreak())
        else:
            story.append(Paragraph(markup(kind, text), st[kind]))
    doc = SimpleDocTemplate(str(output), pagesize=A4, leftMargin=17*mm, rightMargin=17*mm,
                            topMargin=12*mm, bottomMargin=13*mm,
                            title=NAME + ' - .NET Software Engineer', author=NAME,
                            subject='Software engineering experience, skills and education')
    # No hidden keyword list, text boxes, tables, columns or running page furniture.
    doc.build(story)
    plain, md = [], []
    for kind, text in blocks:
        if kind == 'break':
            continue
        prefix = '- ' if kind == 'bullet' else ''
        plain.append(prefix + text)
        md_prefix = {'name': '# ', 'section': '## ', 'company': '### ', 'bullet': '- '}.get(kind, '')
        md.append(md_prefix + text)
    output.with_suffix('.txt').write_text('\n\n'.join(plain) + '\n')
    output.with_suffix('.md').write_text('\n\n'.join(md) + '\n')
    print(output)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT/'assets'/'CV_AlbertoMitroi.pdf')
    build(parser.parse_args().output.resolve())
